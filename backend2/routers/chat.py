"""SSE chat endpoint — streams single-agent responses + session persistence."""
from __future__ import annotations

import asyncio
import json
import logging
import re
import threading
from typing import cast

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage as LCToolMessage
from pydantic import BaseModel
from sqlalchemy.orm import Session

from agent.runner import stream_agent_response
from agent.state import CareerState
from backend2.core.security import get_current_user
from backend2.db.session import get_db
from core.models import (
    ChatMessage,
    ChatSession,
    CoachResult,
    User,
)
from core.services.chat import (
    build_greeting,
    generate_session_title,
    hydrate_state,
    update_coach_memo,
)

logger = logging.getLogger(__name__)

_SSE_TIMEOUT = 120  # 2 minutes max per chat turn
_STREAM_TAIL = 24
_TOOL_LABELS = {
    "diagnose_jd": "正在分析 JD...",
    "search_real_jd": "正在搜索招聘...",
    "get_user_profile": "读取画像...",
    "add_growth_entry": "记录成长档案...",
    "set_career_goal": "更新目标岗位...",
    "track_application": "追踪投递记录...",
}
_ACTION_TAKEN_RE = re.compile(r'\[ACTION_TAKEN:(\w+):([^\]]{1,80})\]')
_JD_SEARCH_RESULTS_RE = re.compile(r'\[JD_SEARCH_RESULTS:(.*)\]', re.DOTALL)
_COACH_RESULT_ID_RE = re.compile(r'\[COACH_RESULT_ID:(\d+)\]')
_SUGGEST_RE = re.compile(r'\[SUGGEST:(\w+):([^\]]{1,100})\]')
_INLINE_MARKER_RE = re.compile(r'\[[A-Z_]+:[^\]]*\]')

router = APIRouter()


def _sse(payload: dict, *, ensure_ascii: bool = False) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=ensure_ascii)}\n\n"


def _normalize_tool_content(content: object) -> str:
    if isinstance(content, list):
        return " ".join(
            item.get("text", "") if isinstance(item, dict) else str(item)
            for item in content
        )
    return str(content or "")


def _strip_coach_result_markers(text: str) -> str:
    return _COACH_RESULT_ID_RE.sub("", text)


def _strip_non_display_markers(text: str) -> str:
    text = _strip_coach_result_markers(text)
    return _JD_SEARCH_RESULTS_RE.sub("", text)


class PageContext(BaseModel):
    route: str = ""
    label: str = ""
    data: dict = {}


class ChatRequest(BaseModel):
    message: str
    session_id: int | None = None
    history: list[dict] = []
    page_context: PageContext | None = None


@router.get("/greeting")
def chat_greeting(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return stage-aware greeting + dynamic chips for the chat panel."""
    return build_greeting(user, db)


@router.post("")
@router.post("/")
async def chat(
    req: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """SSE streaming chat — frontend primary endpoint (POST /api/chat)."""
    import time

    async def _guarded_stream():
        """Wrap the event stream with an overall timeout."""
        start = time.monotonic()
        try:
            async for chunk in _build_agent_event_stream(req, user, db):
                if time.monotonic() - start > _SSE_TIMEOUT:
                    raise TimeoutError()
                yield chunk
        except TimeoutError:
            logger.warning("SSE stream timed out after %ds for user %s", _SSE_TIMEOUT, user.id)
            yield 'data: {"error": "响应超时，请重试"}\n\n'
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.exception("SSE stream error for user %s: %s", user.id, e)
            yield f'data: {{"error": "服务异常 ({type(e).__name__})，请稍后重试"}}\n\n'
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        _guarded_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


async def _build_agent_event_stream(req: ChatRequest, user: User, db: Session):
    """SSE generator for the new single-agent design.

    Extends the existing stream with ACTION_TAKEN chip events from ToolMessages.
    """
    import time as _time

    # ── Session ──────────────────────────────────────────────────────────────
    try:
        if req.session_id:
            session = (
                db.query(ChatSession)
                .filter(ChatSession.id == req.session_id, ChatSession.user_id == user.id)
                .first()
            )
        else:
            session = ChatSession(user_id=user.id, title=req.message[:50])
            db.add(session)
            db.flush()

        if session:
            db.add(ChatMessage(session_id=session.id, role="user", content=req.message))
            db.commit()
            yield _sse({"session_id": session.id})
    except Exception:
        logger.exception("Failed to create chat session (agent route)")
        session = None

    # ── State ────────────────────────────────────────────────────────────────
    initial_state = cast(CareerState, hydrate_state(user, db))
    messages = []
    if session:
        prior_msgs = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session.id)
            .order_by(ChatMessage.created_at)
            .limit(40)
            .all()
        )
        for m in prior_msgs:
            if m.role == "user":
                messages.append(HumanMessage(content=m.content))
            else:
                messages.append(AIMessage(content=m.content))
    else:
        for h in (req.history or []):
            if h.get("role") == "user":
                messages.append(HumanMessage(content=h["content"]))
            else:
                messages.append(AIMessage(content=h["content"]))
        messages.append(HumanMessage(content=req.message))

    initial_state["messages"] = messages
    if req.page_context:
        initial_state["page_context"] = {
            "route": req.page_context.route,
            "label": req.page_context.label,
            "data": req.page_context.data,
        }

    full_response = ""
    _stream_tail = ""
    _ttft_start = _time.time()
    _first_chunk_logged = False

    # ── Stream ───────────────────────────────────────────────────────────────
    try:
        async for msg_chunk, metadata in stream_agent_response(initial_state):
            is_streaming = metadata.get("streaming", False)

            # Tool call start: emit intermediate status label
            if metadata.get("tool_calling"):
                tool_name = metadata["tool_calling"]
                label = _TOOL_LABELS.get(tool_name, f"调用 {tool_name}...")
                yield _sse({"type": "tool_calling", "label": label})
                continue

            # ToolMessage: extract ACTION_TAKEN markers and emit chip events immediately
            if isinstance(msg_chunk, LCToolMessage):
                tool_content = _normalize_tool_content(getattr(msg_chunk, "content", ""))

                for match in _ACTION_TAKEN_RE.finditer(tool_content):
                    yield _sse({
                        "type": "action_taken",
                        "action_type": match.group(1),
                        "label": match.group(2),
                    })

                if "[JD_SEARCH_RESULTS:" in tool_content:
                    jd_match = _JD_SEARCH_RESULTS_RE.search(tool_content)
                    if jd_match:
                        try:
                            yield _sse({"jd_cards": json.loads(jd_match.group(1))})
                        except Exception:
                            pass
                continue

            chunk_content = getattr(msg_chunk, "content", "")
            if not chunk_content:
                continue

            full_response += chunk_content

            if is_streaming:
                _clean = _strip_coach_result_markers(chunk_content)
                if _clean:
                    if not _first_chunk_logged:
                        logger.info("TTFT(agent): %.0f ms user=%d", (_time.time()-_ttft_start)*1000, user.id)
                        _first_chunk_logged = True
                    yield _sse({"content": _clean})
                    await asyncio.sleep(0)
            else:
                _stream_tail += chunk_content
                if len(_stream_tail) > _STREAM_TAIL:
                    _safe = _strip_coach_result_markers(_stream_tail[:-_STREAM_TAIL])
                    if _safe:
                        if not _first_chunk_logged:
                            logger.info("TTFT(agent): %.0f ms user=%d", (_time.time()-_ttft_start)*1000, user.id)
                            _first_chunk_logged = True
                        yield _sse({"content": _safe})
                    _stream_tail = _stream_tail[-_STREAM_TAIL:]

    except Exception as e:
        logger.exception("Agent stream error")
        yield _sse({"error": f"{type(e).__name__}: {str(e)}"})

    # ── Flush tail ───────────────────────────────────────────────────────────
    if _stream_tail:
        _tail_clean = _strip_non_display_markers(_stream_tail)
        if _tail_clean.strip():
            yield _sse({"content": _tail_clean})

    # ── SUGGEST chips (from LLM reply) ───────────────────────────────────────
    for match in _SUGGEST_RE.finditer(full_response):
        yield _sse({"type": "suggest", "action": match.group(1), "prompt": match.group(2)})

    # ── COACH_RESULT_ID card ─────────────────────────────────────────────────
    coach_result_id = None
    cr_match = _COACH_RESULT_ID_RE.search(full_response)
    if cr_match:
        coach_result_id = int(cr_match.group(1))

    if coach_result_id:
        try:
            cr = db.query(CoachResult).filter_by(id=coach_result_id).first()
            if cr:
                if cr.user_id != user.id:
                    cr.user_id = user.id
                if session and cr.session_id != session.id:
                    cr.session_id = session.id
                db.commit()
                meta = json.loads(cr.metadata_json or "{}")
                card_payload: dict = {
                    "type": cr.result_type,
                    "id": cr.id,
                    "title": cr.title,
                    "score": meta.get("match_score"),
                    "gap_count": meta.get("gap_count"),
                }
                if cr.result_type == "jd_diagnosis":
                    try:
                        detail = json.loads(cr.detail_json or "{}")
                        card_payload["jd_title"] = detail.get("jd_title", "")
                        card_payload["company"] = detail.get("company", "")
                        card_payload["job_url"] = detail.get("job_url", "")
                    except Exception:
                        pass
                yield _sse({"card": card_payload})
        except Exception:
            logger.exception("Failed to emit CoachResult card (agent route)")

    # ── Save assistant message ────────────────────────────────────────────────
    clean_response = _INLINE_MARKER_RE.sub('', full_response).strip()
    if session and clean_response:
        try:
            db.add(ChatMessage(session_id=session.id, role="assistant", content=full_response))
            db.commit()
            threading.Thread(target=generate_session_title, args=(session.id, user.id), daemon=True).start()
            threading.Thread(target=update_coach_memo, args=(session.id, user.id), daemon=True).start()
        except Exception:
            logger.exception("Failed to save assistant message (agent route)")

    yield "data: [DONE]\n\n"


# ── FR37: Chat session CRUD ──────────────────────────────────────────────────

@router.get("/sessions")
def list_sessions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List chat sessions for the current user."""
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "title": s.title,
            "updated_at": str(s.updated_at),
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}/messages")
def get_messages(
    session_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages in a chat session."""
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(404, "会话不存在")
    msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return [
        {
            "role": m.role,
            "content": m.content,
            "created_at": str(m.created_at),
        }
        for m in msgs
    ]


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a chat session and its messages."""
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(404, "会话不存在")
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.delete(session)
    db.commit()
    return {"message": "已删除"}
