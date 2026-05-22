"""上下文摘要构建器 — 供单 Agent runner 使用。

每轮对话构建动态 CONTEXT 部分注入系统提示词。
"""
from __future__ import annotations

import json
import logging
from typing import Any, Mapping

from langchain_core.messages import HumanMessage

from agent.market import all_signals as _all_market_signals, get_signal_for_node as _get_signal_for_node
from agent.state import CareerState

logger = logging.getLogger(__name__)

_OLD_TO_NEW_STAGE = {
    "no_profile": "exploring",
    "has_profile": "exploring",
    "first_diagnosis": "job_hunting",
    "training": "job_hunting",
    "growing": "sprinting",
    "report_ready": "sprinting",
}

_STAGE_LABELS = {
    "exploring": "探索方向（未选目标或未生成报告）",
    "focusing": "已选目标，技能补齐中",
    "job_hunting": "求职中（面试 1-2 次）",
    "sprinting": "冲刺期（面试 ≥3 次 或 有 offer）",
}


def _normalize_stage(state: Mapping[str, Any]) -> tuple[str, str]:
    raw = str(state.get("user_stage") or "unknown")
    stage = _OLD_TO_NEW_STAGE.get(raw, raw)
    label = _STAGE_LABELS.get(stage, stage)
    return stage, label


def _get_global_market_summary() -> str:
    signals = _all_market_signals()
    if not signals:
        return ""

    best, good, caution = [], [], []
    for family, sig in signals.items():
        if sig.get("is_proxy"):
            continue
        timing = sig.get("timing", "")
        pct = sig.get("demand_change_pct", 0)
        salary_cagr = sig.get("salary_cagr", 0)
        if timing == "best":
            best.append(f"{family}(需求{pct:+.0f}%，薪资+{salary_cagr:.0f}%/年)")
        elif timing == "good":
            good.append(f"{family}(需求{pct:+.0f}%，薪资+{salary_cagr:.0f}%/年)")
        elif timing == "caution":
            caution.append(f"{family}(需求{pct:+.0f}%)")

    lines = ["- 各CS方向市场时机（系统真实数据，2021→2024年招聘趋势）:"]
    if best:
        lines.append(f"  ✅ 入场好时机: {' / '.join(best)}")
    if good:
        lines.append(f"  ✓ 相对稳健: {' / '.join(good)}")
    if caution:
        lines.append(f"  ⚠️ 岗位收紧（需差异化）: {' / '.join(caution)}")
    lines.append("  [这是系统招聘库的真实数据，用这些数字回答用户，禁止编造其他统计]")
    return "\n".join(lines)


def _build_full_context(state: CareerState) -> str:
    """Round 5+ 的完整上下文。只放状态标记，不放实际数据，强制 LLM 调工具获取详情。"""
    parts = ["当前用户状态："]

    market_summary = _get_global_market_summary()
    if market_summary:
        parts.append(market_summary)

    profile = state.get("user_profile")
    if isinstance(profile, dict):
        parts.append("- 画像: 已建立")
        skills = profile.get("skills", [])
        if skills:
            parts.append(f"- 技能数量: {len(skills)} 项（请调 get_user_profile）")
        edu = profile.get("education", {})
        if isinstance(edu, list) and edu:
            edu = edu[0]
        if isinstance(edu, dict) and edu.get("degree"):
            parts.append("- 学历: 已录入（请调 get_user_profile）")
        resume_projects = profile.get("projects", [])
        if resume_projects:
            parts.append(f"- 项目数量: {len(resume_projects)} 个（请调 get_user_profile）")
        prefs = profile.get("preferences", {})
        if prefs and any(prefs.values()):
            parts.append("- 就业意愿: 已填写（请调 get_user_profile）")
        else:
            parts.append("- 就业意愿: 未填写")
    else:
        parts.append("- 画像: 未建立（建议先上传简历）")

    goal = state.get("career_goal")
    if isinstance(goal, dict):
        parts.append("- 目标岗位: 已锁定（请调 get_career_goal）")
    else:
        parts.append("- 目标岗位: 未设定")

    _stage, label = _normalize_stage(state)
    parts.append(f"- 当前阶段: {label}")

    rec_labels = state.get("recommended_labels", [])
    if rec_labels:
        parts.append("- 系统推荐报告: 已生成（请调 get_recommended_roles 或 get_career_report）")
    else:
        parts.append("- 系统推荐报告: 未生成")

    diag = state.get("last_diagnosis")
    if isinstance(diag, dict):
        parts.append("- 上次JD诊断: 有记录（请调 diagnose_jd 或相关工具）")

    gc = state.get("growth_context")
    if isinstance(gc, dict):
        projects = gc.get("projects", [])
        if projects:
            parts.append(f"- 正在做的项目: {len(projects)} 个（请调 get_project_progress）")
        pursuits = gc.get("pursuits", [])
        if pursuits:
            parts.append(f"- 正在追踪的岗位: {len(pursuits)} 个")

    page = state.get("page_context")
    if isinstance(page, dict):
        parts.append(f"- 用户当前页面: {page.get('label', '')}（{page.get('route', '')}）")

    ap_ctx = state.get("action_plan_context")
    if isinstance(ap_ctx, dict):
        for s in ap_ctx.get("stages", []):
            done, total = s.get("done", 0), s.get("total", 0)
            lbl = s.get("label", f"阶段{s.get('stage')}")
            status = "✅已完成" if done == total and total > 0 else f"{done}/{total}"
            parts.append(f"- 成长计划 {lbl}: {status}")

    # Mem0 长期记忆（尽力获取）
    user_id = state.get("user_id")
    if user_id:
        last_user_msg = ""
        for msg in reversed(state.get("messages", [])):
            if isinstance(msg, HumanMessage):
                last_user_msg = str(msg.content or "")[:200]
                break
        if last_user_msg:
            try:
                from core.services.coach.memory import search_user_context
                memories = search_user_context(user_id, last_user_msg, limit=5)
                if memories:
                    parts.append("\n教练备忘录（Mem0 检索）:")
                    for m in memories:
                        parts.append(f"  · {m[:150]}")
            except Exception:
                pass

    return "\n".join(parts)


def _build_profile_status(state: CareerState) -> str:
    """生成画像状态标记（只放有无，不放具体内容，强制 LLM 调工具获取详情）。"""
    profile = state.get("user_profile")
    if not isinstance(profile, dict):
        return "- 画像：未建立（建议先上传简历）"

    parts = ["- 画像：已建立"]

    skills = profile.get("skills", [])
    if skills:
        parts.append(f"- 技能数量：{len(skills)} 项（具体内容请调 get_user_profile）")

    edu = profile.get("education", {})
    if isinstance(edu, list) and edu:
        edu = edu[0]
    if isinstance(edu, dict) and edu.get("degree"):
        parts.append("- 学历：已录入（具体内容请调 get_user_profile）")

    resume_projects = profile.get("projects", [])
    if resume_projects:
        parts.append(f"- 项目数量：{len(resume_projects)} 个（具体内容请调 get_user_profile）")

    prefs = profile.get("preferences", {})
    if prefs and any(prefs.values()):
        parts.append("- 就业偏好：已填写（具体内容请调 get_user_profile）")
    else:
        parts.append("- 就业偏好：未填写")

    return "\n".join(parts)


def build_context_summary(state: CareerState) -> str:
    """构建系统提示词的动态 CONTEXT 部分。

    只注入状态标记（有无/阶段），不注入实际数据内容，强制 LLM 通过工具获取详情。
    """
    human_count = sum(1 for m in state.get("messages", []) if isinstance(m, HumanMessage))
    _stage, label = _normalize_stage(state)

    # 推荐报告：只放有无，不放具体方向
    rec_labels = state.get("recommended_labels", [])
    rec_status = "- 系统推荐报告：已生成（请调 get_recommended_roles 获取具体内容）" if rec_labels else "- 系统推荐报告：未生成"

    # 目标岗位：只放有无，不放具体名称
    goal = state.get("career_goal")
    goal_status = "- 目标岗位：已锁定（请调 get_career_goal 获取具体内容）" if isinstance(goal, dict) else "- 目标岗位：未锁定"

    profile_status = _build_profile_status(state)

    if human_count <= 2:
        parts = [f"- 当前阶段：{label}", profile_status, rec_status, goal_status]
        return "\n".join(parts)

    if human_count <= 4:
        lines = [f"- 当前阶段：{label}", profile_status, rec_status, goal_status]
        lines.append("（更多历史上下文请通过 get_user_profile / get_recommended_roles / get_career_goal / get_memory_recall 等工具按需调用）")
        return "\n".join(lines)

    return _build_full_context(state)
