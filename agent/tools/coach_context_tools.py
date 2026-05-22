"""Coach pull-based context tools.

设计原则：coach 默认无画像知识，需要时主动调 tool 查。
由 runner 在调用 agent 前通过 ContextVar 注入 state 数据。
"""
from __future__ import annotations

import json
import logging
from contextvars import ContextVar

from langchain_core.tools import tool

from agent.market import get_signal as _get_market_signal

logger = logging.getLogger(__name__)

_ctx_profile: ContextVar[dict | None] = ContextVar("coach_profile", default=None)
_ctx_goal: ContextVar[dict | None] = ContextVar("coach_goal", default=None)
_ctx_user_id: ContextVar[int | None] = ContextVar("coach_user_id", default=None)
_ctx_recommended: ContextVar[list | None] = ContextVar("coach_recommended", default=None)


@tool
def get_user_profile() -> str:
    """获取用户的技能画像、教育背景、项目经验、就业偏好。"""
    profile = _ctx_profile.get()
    if not profile:
        return "用户尚未建立画像（未上传简历），可以建议用户去画像页上传简历"

    lines = []
    skills = profile.get("skills", [])
    if skills:
        names = [s.get("name", "") if isinstance(s, dict) else str(s) for s in skills[:10]]
        lines.append(f"技能：{', '.join(n for n in names if n)}")

    edu = profile.get("education", {})
    if isinstance(edu, dict) and edu.get("degree"):
        lines.append(f"学历：{edu.get('degree', '')} · {edu.get('major', '')}")

    projects = profile.get("projects", [])
    if projects:
        proj_parts = []
        for p in projects[:5]:
            if isinstance(p, dict):
                name = p.get("name", "")
                desc = (p.get("description", "") or "")[:100]
                if name:
                    proj_parts.append(f"{name}（{desc}）" if desc else name)
        if proj_parts:
            lines.append("项目：" + " / ".join(proj_parts))

    prefs = profile.get("preferences", {})
    if prefs:
        lines.append(f"偏好：{json.dumps(prefs, ensure_ascii=False)}")

    job_target = profile.get("job_target", "")
    if job_target:
        lines.append(f"求职意向：{job_target}")

    # 目标方向（已从 CareerGoal 合并进画像层）
    goal = profile.get("career_goal")
    if isinstance(goal, dict) and goal.get("label"):
        lines.append(f"目标岗位：{goal['label']}（图谱节点：{goal.get('node_id', '')}）")

    return "\n".join(lines) if lines else "画像数据为空"


@tool
def get_career_goal() -> str:
    """获取用户已锁定的目标岗位。"""
    goal = _ctx_goal.get()
    if not goal:
        return "用户尚未锁定目标岗位（可以建议去图谱页探索方向）"
    return (
        f"目标岗位：{goal.get('label', '未知')}\n"
        f"图谱节点：{goal.get('node_id', '')}\n"
        f"目标区域：{goal.get('zone', '')}"
    )


@tool
def get_market_signal(direction: str) -> str:
    """查询某个职业方向的真实市场数据（需求变化、薪资年涨、时机、AI渗透）。

    direction: 方向名或口语化说法，如"后端开发"/"AI"/"算法"，会自动规范化。
    """
    try:
        signal = _get_market_signal(direction)
        if not signal:
            # 只有空输入才会到这里
            return "没听清你想问哪个方向，能再说具体点吗？"

        resolved = signal.get("_resolved_family", direction)
        confidence = signal.get("_confidence", "exact")
        demand = signal.get("demand_change_pct", 0)
        salary = signal.get("salary_cagr", 0)
        timing = signal.get("timing_label", "")
        ai_label = signal.get("ai_label", "")
        top_inds = signal.get("top_industries", []) or []

        header = f"{resolved} 市场数据"
        # 用户说法 ≠ 解析结果时，告诉 LLM 一下方便自然表达（"工程经理属于管理类，..."）
        if resolved != direction.strip():
            if confidence in ("heuristic", "fallback"):
                header += f"  [用户说的「{direction}」归入最接近的「{resolved}」类]"
            else:
                header += f"  [用户说的「{direction}」解析为「{resolved}」]"

        lines = [
            header + "：",
            f"- 需求变化：{demand:+.0f}%",
            f"- 薪资年涨：{salary:+.1f}%",
            f"- 时机：{timing}",
        ]
        if ai_label:
            lines.append(f"- AI 渗透：{ai_label}")
        if top_inds:
            ind_names = ", ".join(
                (i.get("industry", "") or "")[:10] for i in top_inds[:3]
            )
            lines.append(f"- 主要招聘行业：{ind_names}")

        return "\n".join(lines)
    except Exception as e:
        logger.warning("get_market_signal(%s) failed: %s", direction, e)
        return f"查询「{direction}」市场数据失败"


@tool
def get_memory_recall(query: str = "用户偏好") -> str:
    """检索用户过往对话中的长期记忆（Mem0）。

    query: 想找的主题，如"职业偏好"/"之前提到的项目"/"决策倾向"。
    """
    user_id = _ctx_user_id.get()
    if not user_id:
        return "用户上下文未注入"
    try:
        from core.services.coach.memory import search_user_context
        memories = search_user_context(user_id, query, limit=3)
        if not memories:
            return f"未找到关于「{query}」的历史记忆"
        return "历史记忆：\n" + "\n".join(f"· {m[:150]}" for m in memories)
    except Exception as e:
        logger.warning("get_memory_recall(%s) failed user=%s: %s", query, user_id, e)
        return "记忆检索暂不可用"


@tool
def get_career_report() -> str:
    """获取用户最新的完整职业发展报告（匹配度、技能缺口、行动计划、市场分析等）。"""
    user_id = _ctx_user_id.get()
    if not user_id:
        return "用户上下文未注入，无法查询报告"
    try:
        from core.db import SessionLocal
        from core.models import Report
        db = SessionLocal()
        try:
            report = (
                db.query(Report)
                .filter(Report.user_id == user_id)
                .order_by(Report.created_at.desc())
                .first()
            )
            if not report:
                return "用户尚未生成职业发展报告（需要去报告页点击生成）"

            data = json.loads(report.data_json or "{}")
            if not data:
                return "报告数据为空"

            target = data.get("target", {})
            match_score = data.get("match_score", 0)
            narrative = data.get("narrative", "")
            four_dim = data.get("four_dim", {})
            skill_gap = data.get("skill_gap", {})
            action_plan = data.get("action_plan", {})
            market = data.get("market", {})
            delta = data.get("delta")

            lines = [
                f"《{target.get('label', '职业发展')}报告》（生成于 {report.created_at.strftime('%Y-%m-%d') if report.created_at else '未知'}）",
                f"匹配度：{match_score}%",
            ]

            if four_dim:
                lines.append("四维评分：")
                for k, v in four_dim.items():
                    lines.append(f"  · {k}：{v}")

            if narrative:
                lines.append(f"\n综述：{narrative[:400]}")

            if skill_gap:
                top_missing = skill_gap.get("top_missing", [])
                if top_missing:
                    lines.append("\n主要技能缺口：")
                    for m in top_missing[:5]:
                        name = m.get("name", "") if isinstance(m, dict) else str(m)
                        tier = m.get("tier", "") if isinstance(m, dict) else ""
                        lines.append(f"  · {name}" + (f"（{tier}）" if tier else ""))

            if action_plan:
                stages = action_plan.get("stages", [])
                if stages:
                    lines.append("\n行动计划：")
                    for stg in stages[:3]:
                        label = stg.get("label", "")
                        items = stg.get("items", [])
                        lines.append(f"  · {label}")
                        for it in items[:3]:
                            lines.append(f"    - {it.get('observation', it.get('text', ''))}")

            if market:
                lines.append(f"\n市场：{market.get('timing_label', '')}，需求变化 {market.get('demand_change_pct', 0):+.0f}%")

            if delta:
                lines.append(f"\n对比上期：匹配度变化 {delta.get('score_change', 0):+.0f} 分")
                gained = delta.get("gained_skills", [])
                if gained:
                    lines.append(f"新增掌握技能：{', '.join(gained)}")

            return "\n".join(lines)
        finally:
            db.close()
    except Exception as e:
        logger.warning("get_career_report failed user=%s: %s", user_id, e)
        return f"查询报告失败：{e}"


@tool
def get_recommended_roles() -> str:
    """获取系统为用户推荐的岗位方向（与画像页数据一致，含匹配度、推荐理由、待补技能）。"""
    recs = _ctx_recommended.get()
    if not recs:
        return "系统尚未生成推荐方向（可能画像刚建好，推荐正在后台计算，建议用户刷新画像页查看）"

    lines = [f"系统为你推荐了 {len(recs)} 个方向（与画像页一致）：\n"]
    for r in recs:
        label = r.get("label", r.get("role_id", "?"))
        pct = r.get("affinity_pct", 0)
        zone = r.get("zone", "")
        reason = r.get("reason", "")
        channel = r.get("channel", "")
        gap = r.get("gap_skills", [])

        lines.append(f"【{label}】匹配度 {pct}%  {zone}区")
        if reason:
            lines.append(f"  推荐理由：{reason}")
        if channel:
            lines.append(f"  通道：{channel}")
        if gap:
            gap_names = [g if isinstance(g, str) else str(g) for g in gap[:4]]
            lines.append(f"  待补技能：{', '.join(gap_names)}")
        lines.append("")

    return "\n".join(lines)


