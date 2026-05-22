"""统一工具注册表 — 单 Agent 设计。

导入 ALL_TOOLS 即可获取 agent 初始化所需的全部工具列表。
工具按领域分组；顺序影响 LLM 看到它们的先后。
"""
from __future__ import annotations

# ── 读取：画像 & 目标 ──────────────────────────────────────────────────────
from agent.tools.coach_context_tools import (
    get_user_profile,
    get_career_goal,
    get_career_report,
    get_market_signal,
    get_memory_recall,
    get_recommended_roles,
)

# ── 读取：图谱 & 成长 ──────────────────────────────────────────────────────
from agent.tools.graph_tools import get_job_detail, search_jobs
from agent.tools.growth_tools import get_dashboard_stats, get_project_progress

# ── 读取：搜索 ──────────────────────────────────────────────────────────────
from agent.tools.search_tools import search_real_jd

# ── 写入 ─────────────────────────────────────────────────────────────────────
from agent.tools.write_tools import (
    add_growth_entry,
    set_career_goal,
    track_application,
    diagnose_jd,
)

ALL_TOOLS = [
    # 画像 & 目标读取
    get_user_profile,
    get_career_goal,
    get_career_report,
    get_recommended_roles,
    get_market_signal,
    get_memory_recall,
    # 图谱 & 岗位读取
    get_job_detail,
    search_jobs,
    # 成长数据读取
    get_dashboard_stats,
    get_project_progress,
    # 搜索
    search_real_jd,
    # 写操作
    diagnose_jd,
    add_growth_entry,
    set_career_goal,
    track_application,
]
