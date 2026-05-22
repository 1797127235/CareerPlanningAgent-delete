"""工具按需过滤 — 参考 Lumen 的动态工具加载设计。

LangChain create_agent 的 middleware 机制允许在每次模型调用前
动态裁剪工具列表，只保留与用户意图相关的工具。
"""
from __future__ import annotations

import logging

from langchain.agents.middleware import wrap_model_call, ModelRequest
from langchain_core.tools import BaseTool

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════
#  工具元数据：分类 + 触发关键词
# ═══════════════════════════════════════════════════════════════════════

_TOOL_TRIGGERS: dict[str, list[str]] = {
    # 核心读操作
    "get_user_profile": ["画像", "技能", "项目", "简历", "适合", "优势", "背景", "我有什么"],
    "get_career_report": ["报告", "职业报告", "发展报告", "完整报告", "分析报告"],
    "get_recommended_roles": ["推荐", "方向", "适合", "对比", "介绍", "探索", "系统推荐"],
    "get_market_signal": ["前景", "市场", "薪资", "需求", "时机", "卷", "替代", "好不好", "怎么样", "涨"],
    "get_career_goal": ["目标", "方向", "锁定", "选定", "已选"],
    "get_memory_recall": ["记得", "上次", "之前", "以前", "说过", "聊到"],
    # 图谱 & 搜索
    "search_jobs": ["搜索", "查找", "找", "岗位", "职位", "工作"],
    "get_job_detail": ["详情", "是什么", "做什么", "具体", "岗位介绍"],
    "search_real_jd": ["招聘", "真实", "jd", "职位描述", "校招", "社招"],
    # 成长 & 仪表盘
    "get_dashboard_stats": ["进度", "统计", "数据", "仪表盘", "多少", "次数"],
    "get_project_progress": ["项目", "进展", "进度", "做到哪", "完成"],
    # 写操作（通常由用户明确行为触发）
    "diagnose_jd": ["jd", "诊断", "匹配", "岗位描述", "任职要求"],
    "add_growth_entry": ["学了", "做完", "完成", "读了", "考了", "记录", "打卡"],
    "set_career_goal": ["决定", "锁定", "选择", "设目标", "目标岗位", "我要做"],
    "track_application": ["投递", "申请", "投了", "投了简历", "面试了", "offer"],
}

# 始终可见的核心工具（无论用户消息是什么）
_ALWAYS_ON_TOOLS: set[str] = {
    "get_user_profile",
    "get_recommended_roles",
    "get_career_report",
    "diagnose_jd",      # 用户可能突然粘一段 JD
    "add_growth_entry",  # 用户可能突然说"我今天学了 XX"
}

# 最大可见工具数（包括 always_on + 匹配的）
_MAX_VISIBLE_TOOLS = 8


def _extract_user_input(request: ModelRequest) -> str:
    """从 ModelRequest 中提取用户最后一条消息。"""
    for msg in reversed(request.messages):
        if getattr(msg, "type", None) == "human":
            return str(getattr(msg, "content", "") or "")
    return ""


def _match_tools(user_input: str) -> set[str]:
    """根据用户消息匹配相关工具。"""
    if not user_input:
        return set()

    user_lower = user_input.lower()
    matched: set[str] = set()

    for tool_name, triggers in _TOOL_TRIGGERS.items():
        for keyword in triggers:
            if keyword.lower() in user_lower:
                matched.add(tool_name)
                break

    return matched


@wrap_model_call
async def filter_tools_by_intent(request: ModelRequest, handler):
    """Middleware：根据用户意图动态过滤工具列表。

    策略：
    1. 始终保留 _ALWAYS_ON_TOOLS
    2. 根据用户消息匹配相关工具
    3. 如果匹配数超过 _MAX_VISIBLE_TOOLS，优先保留 always_on
    """
    user_input = _extract_user_input(request)
    matched = _match_tools(user_input)
    visible = _ALWAYS_ON_TOOLS | matched

    all_tools: list[BaseTool] = request.tools or []
    filtered = [t for t in all_tools if t.name in visible]

    # 兜底：至少保留 always_on
    if not filtered:
        filtered = [t for t in all_tools if t.name in _ALWAYS_ON_TOOLS]

    # 如果还是空（理论上不会发生），保留全部
    if not filtered and all_tools:
        filtered = all_tools

    if len(filtered) < len(all_tools):
        logger.info(
            "Tool filter: %d -> %d visible (%s)",
            len(all_tools),
            len(filtered),
            ", ".join(t.name for t in filtered),
        )

    return await handler(request.override(tools=filtered))
