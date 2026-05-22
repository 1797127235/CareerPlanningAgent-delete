"""单 Agent 使用的成长记录查询工具。"""
from __future__ import annotations

from contextvars import ContextVar

from langchain_core.tools import tool

# 由 runner 在调用 agent 前注入
_injected_user_id: ContextVar[int | None] = ContextVar('_growth_user_id', default=None)


@tool
def get_dashboard_stats(profile_id: int) -> str:
    """获取用户的学习进度、诊断次数、连续天数等仪表盘统计。"""
    if not profile_id:
        return "需要提供画像ID才能查询仪表盘数据。"

    try:
        from core.db import SessionLocal
        from core.services.dashboard_service import get_dashboard_stats as _get_stats

        db = SessionLocal()
        try:
            stats = _get_stats(profile_id, db)
        finally:
            db.close()
    except Exception as e:
        return f"获取仪表盘数据时出错：{e}"

    lines = [
        f"画像 #{profile_id} 学习仪表盘：\n",
        f"  JD诊断次数: {stats.get('jd_diagnosis_count', 0)}",
        f"  项目记录数: {stats.get('project_count', 0)}",
        f"  岗位追踪数: {stats.get('application_count', 0)}",
        f"  面试记录数: {stats.get('interview_count', 0)}",
        f"  连续活跃天数: {stats.get('streak_days', 0)} 天",
    ]

    recent_acts = stats.get("recent_activities", [])
    if recent_acts:
        lines.append(f"\n最近活动 ({len(recent_acts)})：")
        for act in recent_acts[:5]:
            lines.append(f"  · {act.get('title', '?')}（{act.get('date', '')[:10]}）")

    return "\n".join(lines)


@tool
def get_project_progress(project_name: str = "") -> str:
    """查询用户的项目进展记录。可按项目名过滤，不传则返回所有进行中项目的最新进展。"""
    user_id = _injected_user_id.get()
    if not user_id:
        return "无法获取用户信息。"

    try:
        from core.db import SessionLocal
        from core.models import ProjectRecord, ProjectLog

        db = SessionLocal()
        try:
            q = db.query(ProjectRecord).filter_by(user_id=user_id)
            if project_name:
                q = q.filter(ProjectRecord.name.contains(project_name))
            else:
                q = q.filter(ProjectRecord.status == "in_progress")
            projects = q.order_by(ProjectRecord.updated_at.desc()).limit(5).all()

            result_lines = []
            for p in projects:
                status_map = {"planning": "规划中", "in_progress": "进行中", "completed": "已完成"}
                skills_str = "、".join((p.skills_used or [])[:4])
                result_lines.append(f"【{p.name}】{status_map.get(p.status, p.status)}")
                if skills_str:
                    result_lines.append(f"  技术栈: {skills_str}")
                if p.description:
                    result_lines.append(f"  简介: {p.description[:60]}{'…' if len(p.description) > 60 else ''}")

                # Latest 3 logs
                logs = (
                    db.query(ProjectLog)
                    .filter_by(project_id=p.id)
                    .order_by(ProjectLog.created_at.desc())
                    .limit(3)
                    .all()
                )
                if logs:
                    result_lines.append("  最近进展:")
                    task_status_map = {"done": "✓", "in_progress": "→", "blocked": "✗"}
                    for log in logs:
                        mark = task_status_map.get(log.task_status or "done", "")
                        result_lines.append(f"    {mark} {log.content[:50]}{'…' if len(log.content) > 50 else ''}")
                result_lines.append("")
        finally:
            db.close()
    except Exception as e:
        return f"查询项目进展时出错：{e}"

    if not result_lines:
        return f"没有找到{'「' + project_name + '」的' if project_name else '进行中的'}项目。"

    return "\n".join(result_lines)
