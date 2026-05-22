"""写回工具 — 单 Agent 重构版。

所有工具从共享的 ContextVar (_ctx_user_id) 读取 user_id，
该变量由 runner.py 在调用 agent.astream() 前设置。
工具不会回退到查询 DB 获取 user_id — 调用方保证已设置。
"""
from __future__ import annotations

import json
import logging
from contextvars import ContextVar
from datetime import datetime, timezone

from langchain_core.tools import tool

logger = logging.getLogger(__name__)

_ctx_user_id: ContextVar[int | None] = ContextVar("write_tools_user_id", default=None)


@tool
def add_growth_entry(
    type: str,
    title: str,
    skills: list[str],
    hours: float | None = None,
) -> str:
    """记录一条成长档案（学习/项目/阅读/练习）。

    type: 'study' | 'project' | 'reading' | 'practice'
    title: 如"Redis AOF 持久化学习"
    skills: 涉及技能列表，如 ["Redis", "Linux"]
    hours: 花费时长（小时），可选
    """
    user_id = _ctx_user_id.get()
    if not user_id:
        return "无法记录：用户未登录"

    try:
        from core.db import SessionLocal
        from core.models import GrowthEntry

        structured = {"duration_hours": hours} if hours is not None else None
        entry = GrowthEntry(
            user_id=user_id,
            content=title,
            category=type,
            tags=skills or [],
            structured_data=structured,
            status="done",
        )
        db = SessionLocal()
        try:
            db.add(entry)
            db.commit()
        finally:
            db.close()

        return f"[ACTION_TAKEN:growth_entry:已记录「{title}」到成长档案]"
    except Exception as e:
        logger.warning("add_growth_entry failed user=%s: %s", user_id, e)
        return f"记录失败：{e}"


@tool
def set_career_goal(node_id: str, label: str) -> str:
    """设定或更新用户的目标岗位方向。

    node_id: 图谱节点 ID，如 "cs_backend_java"
    label: 显示名称，如 "后端工程师"
    """
    user_id = _ctx_user_id.get()
    if not user_id:
        return "无法设定目标：用户未登录"

    try:
        from core.db import SessionLocal
        from core.models import CareerGoal, Profile

        db = SessionLocal()
        try:
            profile = db.query(Profile).filter(Profile.user_id == user_id).first()
            if not profile:
                return "请先上传简历建立画像，再设定目标方向"

            existing = (
                db.query(CareerGoal)
                .filter_by(user_id=user_id, profile_id=profile.id, is_active=True)
                .first()
            )
            if existing:
                existing.target_node_id = node_id
                existing.target_label = label
                existing.set_at = datetime.now(timezone.utc)
            else:
                db.add(CareerGoal(
                    user_id=user_id,
                    profile_id=profile.id,
                    target_node_id=node_id,
                    target_label=label,
                    target_zone="safe",
                    is_primary=True,
                    is_active=True,
                ))
            db.commit()
        finally:
            db.close()

        return f"[ACTION_TAKEN:goal_set:目标岗位已更新为「{label}」]"
    except Exception as e:
        logger.warning("set_career_goal failed user=%s: %s", user_id, e)
        return f"目标设定失败：{e}"


@tool
def track_application(
    company: str,
    role: str,
    status: str = "applied",
    notes: str | None = None,
) -> str:
    """追踪一条投递记录。

    company: 公司名称
    role: 岗位名称
    status: 'applied' | 'interviewing' | 'offered' | 'rejected'（默认 applied）
    notes: 备注，可选
    """
    user_id = _ctx_user_id.get()
    if not user_id:
        return "无法追踪：用户未登录"

    try:
        from core.db import SessionLocal
        from core.models import JobApplication

        db = SessionLocal()
        try:
            db.add(JobApplication(
                user_id=user_id,
                company=company,
                position=role,
                status=status,
                notes=notes,
            ))
            db.commit()
        finally:
            db.close()

        return f"[ACTION_TAKEN:application:已追踪「{company} · {role}」]"
    except Exception as e:
        logger.warning("track_application failed user=%s: %s", user_id, e)
        return f"追踪失败：{e}"


@tool
def diagnose_jd(jd_text: str) -> str:
    """分析岗位JD与用户画像的匹配度，识别技能缺口。

    jd_text: 完整的岗位JD文本（≥50字）
    返回值含 [COACH_RESULT_ID:N]，前端解析后展示诊断卡片。
    """
    if not jd_text or not jd_text.strip():
        return "请提供岗位JD文本内容。"

    user_id = _ctx_user_id.get()
    if not user_id:
        return "无法诊断：用户未登录"

    # 从 DB 加载画像 — 不做跨用户兜底
    try:
        from core.db import SessionLocal
        from core.models import Profile

        db = SessionLocal()
        try:
            p = (
                db.query(Profile)
                .filter(Profile.user_id == user_id)
                .order_by(Profile.updated_at.desc())
                .first()
            )
            profile = json.loads(p.profile_json or "{}") if p else None
        finally:
            db.close()
    except Exception as e:
        return f"加载画像失败：{e}"

    if not profile:
        return "未找到用户画像，请先上传简历建立画像后再进行 JD 诊断。"

    try:
        from core.services.jd_service import JDService
        result = JDService().diagnose(jd_text, profile)
    except Exception as e:
        return f"JD诊断出错：{e}"

    match_score = result.get("match_score", 0)
    matched = result.get("matched_skills", [])
    gaps = result.get("gap_skills", [])
    jd_title = result.get("jd_title", "")

    from agent.tools.jd_tools import _save_jd_coach_result
    coach_result_id = _save_jd_coach_result(
        jd_text, match_score, matched, gaps, jd_title, user_id=user_id,
    )

    gap_names = [
        g.get("skill", "?") if isinstance(g, dict) else str(g)
        for g in gaps[:5]
    ]
    lines = [
        f"JD匹配度: {match_score}%",
        f"已匹配技能: {', '.join(matched[:5]) if matched else '无'}",
        f"技能缺口: {', '.join(gap_names) if gap_names else '无'}",
    ]
    if coach_result_id:
        lines.append(f"[COACH_RESULT_ID:{coach_result_id}]")

    return "\n".join(lines)
