"""单 Agent 对话的共享状态黑板。"""
from __future__ import annotations

from typing import Annotated, Any, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class CareerState(TypedDict):
    """单 Agent 运行时共享状态。"""

    messages: Annotated[list[BaseMessage], add_messages]
    user_id: int | None  # 已认证用户
    profile_id: int | None  # 当前活跃画像
    user_profile: dict[str, Any] | None  # 缓存的画像数据
    career_goal: dict[str, Any] | None  # 目标岗位节点
    current_node_id: str | None  # 图谱定位结果
    user_stage: str  # no_profile | no_goal | beginner | ...
    last_diagnosis: dict[str, Any] | None  # 最近一次 JD 诊断结果
    coach_memo: str  # 关于用户的自然语言备忘（来自历史会话）
    page_context: dict[str, Any] | None  # {route, label, data} — 用户当前所在页面
    tool_hint: str  # 给工具使用的偏好提示（如 "search_real_jd"）
    last_active_agent: str  # 追踪上一个响应节点，便于后续诊断
    growth_context: dict[str, Any] | None  # 成长日志中的项目 + 求职追踪
    recommended_data: list[dict[str, Any]] | None  # 画像页推荐方向原始数据
    recommended_labels: list[str]  # 推荐方向标签摘要
    action_plan_context: dict[str, Any] | None  # 报告行动计划进度摘要
