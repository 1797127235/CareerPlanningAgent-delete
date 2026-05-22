"""Tests for the chat SSE endpoint and event stream shaping."""
from __future__ import annotations

import json
from types import SimpleNamespace
from typing import cast
from unittest.mock import patch

from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage, ToolMessage
from sqlalchemy.orm import Session

from backend2.app import app
from backend2.core.security import get_current_user
from backend2.db.session import get_db
from backend2.routers import chat as chat_router
from core.models import ChatMessage, ChatSession, CoachResult, User


class _FakeQuery:
    def __init__(self, first_result=None, all_result=None):
        self._first_result = first_result
        self._all_result = all_result if all_result is not None else []

    def filter(self, *args, **kwargs):
        return self

    def filter_by(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def first(self):
        return self._first_result

    def all(self):
        return list(self._all_result)

    def delete(self):
        return len(self._all_result)


class _FakeDB:
    def __init__(self, *, sessions=None, messages=None):
        self.chat_session = SimpleNamespace(id=9, user_id=1, title="会话")
        self.coach_result = SimpleNamespace(
            id=123,
            user_id=1,
            session_id=None,
            result_type="jd_diagnosis",
            title="JD 诊断",
            metadata_json=json.dumps({"match_score": 82, "gap_count": 1}, ensure_ascii=False),
            detail_json=json.dumps(
                {"jd_title": "后端工程师", "company": "字节跳动", "job_url": "https://example.com/jd"},
                ensure_ascii=False,
            ),
        )
        self.sessions = sessions if sessions is not None else [self.chat_session]
        self.messages = messages if messages is not None else []
        self.added = []
        self.commits = 0
        self.deleted = []

    def query(self, model):
        if model is ChatSession:
            first = self.sessions[0] if self.sessions else None
            return _FakeQuery(first_result=first, all_result=self.sessions)
        if model is ChatMessage:
            return _FakeQuery(all_result=self.messages)
        if model is CoachResult:
            return _FakeQuery(first_result=self.coach_result)
        return _FakeQuery()

    def add(self, obj):
        self.added.append(obj)

    def commit(self):
        self.commits += 1

    def flush(self):
        return None

    def delete(self, obj):
        self.deleted.append(obj)


class _DummyThread:
    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs

    def start(self):
        return None


def _override_user():
    return SimpleNamespace(id=1, username="demo")


def _override_db():
    yield _FakeDB()


class TestChatRoute:
    def setup_method(self):
        app.dependency_overrides[get_current_user] = _override_user
        app.dependency_overrides[get_db] = _override_db

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_chat_endpoint_streams_sse_response(self):
        async def _fake_stream(req, user, db):
            yield 'data: {"content": "hello"}\n\n'
            yield 'data: [DONE]\n\n'

        with patch.object(chat_router, "_build_agent_event_stream", _fake_stream):
            client = TestClient(app, raise_server_exceptions=False)
            response = client.post("/api/chat/", json={"message": "你好"})

        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/event-stream")
        assert response.headers["cache-control"] == "no-cache, no-transform"
        assert 'data: {"content": "hello"}' in response.text
        assert "data: [DONE]" in response.text

    def test_chat_endpoint_returns_generic_error_event(self):
        async def _boom(req, user, db):
            raise RuntimeError("boom")
            yield  # pragma: no cover

        with patch.object(chat_router, "_build_agent_event_stream", _boom):
            client = TestClient(app, raise_server_exceptions=False)
            response = client.post("/api/chat/", json={"message": "你好"})

        assert response.status_code == 200
        assert "服务异常 (RuntimeError)" in response.text
        assert "data: [DONE]" in response.text

    def test_list_sessions_route(self):
        fake_db = _FakeDB(sessions=[SimpleNamespace(id=9, user_id=1, title="会话A", updated_at="2026-01-01")])

        def _db_override():
            yield fake_db

        app.dependency_overrides[get_db] = _db_override
        client = TestClient(app, raise_server_exceptions=False)
        response = client.get("/api/chat/sessions")

        assert response.status_code == 200
        assert response.json() == [{"id": 9, "title": "会话A", "updated_at": "2026-01-01"}]

    def test_get_messages_route(self):
        fake_db = _FakeDB(
            sessions=[SimpleNamespace(id=9, user_id=1, title="会话A")],
            messages=[SimpleNamespace(role="user", content="你好", created_at="2026-01-01")],
        )

        def _db_override():
            yield fake_db

        app.dependency_overrides[get_db] = _db_override
        client = TestClient(app, raise_server_exceptions=False)
        response = client.get("/api/chat/sessions/9/messages")

        assert response.status_code == 200
        assert response.json() == [{"role": "user", "content": "你好", "created_at": "2026-01-01"}]

    def test_delete_session_route(self):
        fake_db = _FakeDB(sessions=[SimpleNamespace(id=9, user_id=1, title="会话A")])

        def _db_override():
            yield fake_db

        app.dependency_overrides[get_db] = _db_override
        client = TestClient(app, raise_server_exceptions=False)
        response = client.delete("/api/chat/sessions/9")

        assert response.status_code == 200
        assert response.json() == {"message": "已删除"}
        assert fake_db.deleted
        assert fake_db.commits == 1


class TestBuildAgentEventStream:
    def test_event_stream_emits_tool_status_action_cards_and_done(self):
        fake_db = _FakeDB()
        req = chat_router.ChatRequest(message="帮我看看这个 JD", session_id=9)
        user = cast(User, SimpleNamespace(id=1, username="demo"))

        async def _fake_agent_stream(_state):
            yield AIMessage(content=""), {"tool_calling": "search_real_jd", "streaming": False}
            yield ToolMessage(content='[ACTION_TAKEN:application:已追踪投递][JD_SEARCH_RESULTS:[{"title":"后端JD"}]]', tool_call_id="1"), {
                "streaming": False,
            }
            yield AIMessage(content="分析完成[COACH_RESULT_ID:123][SUGGEST:next:继续优化简历]"), {"streaming": True}

        with patch.object(chat_router, "hydrate_state", return_value={"messages": []}):
            with patch.object(chat_router, "stream_agent_response", _fake_agent_stream):
                with patch("threading.Thread", _DummyThread):
                    chunks = []

                    async def _collect():
                        async for chunk in chat_router._build_agent_event_stream(req, user, cast(Session, fake_db)):
                            chunks.append(chunk)

                    import asyncio
                    asyncio.run(_collect())

        payload = "".join(chunks)
        assert '"session_id": 9' in payload
        assert '"type": "tool_calling"' in payload
        assert '正在搜索招聘' in payload
        assert '"type": "action_taken"' in payload
        assert '已追踪投递' in payload
        assert '"jd_cards": [{"title": "后端JD"}]' in payload
        assert '"content": "分析完成[SUGGEST:next:继续优化简历]"' in payload
        assert '"type": "suggest"' in payload
        assert '继续优化简历' in payload
        assert '"card":' in payload
        assert '"id": 123' in payload
        assert payload.rstrip().endswith("data: [DONE]")
        assert fake_db.coach_result.user_id == 1
        assert fake_db.coach_result.session_id == 9
        assert len(fake_db.added) >= 2
        assert any(getattr(obj, "role", None) == "user" for obj in fake_db.added)
        assert any(getattr(obj, "role", None) == "assistant" for obj in fake_db.added)
        assert fake_db.commits >= 2
