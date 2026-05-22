"""单 Agent 运行器 — 新版聊天机器人入口。

用单次 ReAct 调用替代原来的 Supervisor → 分流 → 交接链路。
当前主聊天路由通过本模块流式驱动单 Agent。
"""
from __future__ import annotations

import logging

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

from agent.agent import SYSTEM_PROMPT_TEMPLATE, create_agent
from agent.context import build_context_summary
from agent.state import CareerState

logger = logging.getLogger(__name__)

# 单例 — agent 无状态，创建一次即可
_agent = None


def _get_agent():
    global _agent
    if _agent is None:
        _agent = create_agent()
    return _agent


def _build_system_message(state: CareerState) -> SystemMessage:
    """渲染系统提示词，填充动态 CONTEXT 和 SKILLS 部分。"""
    from agent.skills.loader import format_skills_for_prompt
    context = build_context_summary(state)

    # 取用户最后一条消息用于 skill 按需匹配
    user_input = ""
    for msg in reversed(state.get("messages", [])):
        if isinstance(msg, HumanMessage):
            user_input = str(msg.content or "")
            break

    skills = format_skills_for_prompt(user_input)
    content = (
        SYSTEM_PROMPT_TEMPLATE
        .replace("{CONTEXT}", context)
        .replace("{SKILLS}", skills)
    )
    return SystemMessage(content=content)


def _set_context_vars(state: CareerState) -> list:
    """注入工具所需的所有 ContextVar。返回重置令牌列表。"""
    resets = []

    # 写操作工具 — DB 写入用的 user_id
    from agent.tools.write_tools import _ctx_user_id as _write_uid
    resets.append((_write_uid, _write_uid.set(state.get("user_id"))))

    # 教练上下文工具 — 画像、目标、user_id、推荐结果
    from agent.tools.coach_context_tools import (
        _ctx_profile, _ctx_goal,
        _ctx_user_id as _coach_uid,
        _ctx_recommended,
    )
    resets.append((_ctx_profile, _ctx_profile.set(state.get("user_profile"))))
    resets.append((_ctx_goal, _ctx_goal.set(state.get("career_goal"))))
    resets.append((_coach_uid, _coach_uid.set(state.get("user_id"))))
    resets.append((_ctx_recommended, _ctx_recommended.set(state.get("recommended_data"))))

    # 成长工具 — 面试/项目查询用的 user_id
    from agent.tools.growth_tools import _injected_user_id as _growth_uid
    resets.append((_growth_uid, _growth_uid.set(state.get("user_id"))))

    # 搜索工具 — 用画像 + 目标做上下文搜索
    try:
        from agent.tools.search_tools import (
            _injected_profile_for_search,
            _injected_goal_for_search,
        )
        resets.append((_injected_profile_for_search,
                        _injected_profile_for_search.set(state.get("user_profile"))))
        resets.append((_injected_goal_for_search,
                        _injected_goal_for_search.set(state.get("career_goal"))))
    except (ImportError, AttributeError):
        pass

    return resets


def _reset_context_vars(resets: list) -> None:
    for var, tok in resets:
        try:
            var.reset(tok)
        except Exception:
            pass


async def stream_agent_response(state: CareerState):
    """为新版单 Agent 设计逐块产出 (msg_chunk, metadata)。

    与 chat router 当前的流式消费者接口兼容。
    ToolMessage 原样产出，以便 chat router 解析 ACTION_TAKEN 标记。
    """
    resets = _set_context_vars(state)
    sys_msg = _build_system_message(state)

    # 构建输入消息：系统消息 + 对话历史
    messages = state.get("messages", [])
    _MAX_MSGS = 60
    if len(messages) > _MAX_MSGS:
        messages = messages[-_MAX_MSGS:]

    input_msgs = [sys_msg] + list(messages)

    agent = _get_agent()

    try:
        async for chunk, _meta in agent.astream(
            {"messages": input_msgs},
            stream_mode="messages",
        ):
            if isinstance(chunk, ToolMessage):
                # 通过 ToolMessage 传递 — chat router 提取 ACTION_TAKEN
                yield chunk, {"langgraph_node": "career_agent", "streaming": False}
                continue

            if isinstance(chunk, (HumanMessage, SystemMessage)):
                continue

            if isinstance(chunk, AIMessage):
                if getattr(chunk, "tool_calls", None):
                    tool_name = chunk.tool_calls[0].get("name", "")
                    yield chunk, {"langgraph_node": "career_agent", "streaming": False, "tool_calling": tool_name}
                    continue
                if not chunk.content:
                    continue

            yield chunk, {"langgraph_node": "career_agent", "streaming": True}

    except Exception as e:
        # 记录完整堆栈，方便定位根因
        logger.exception("Single-agent streaming failed: %s", e)

        # 区分常见错误，给用户更有针对性的提示
        err_msg = "抱歉，处理你的请求时遇到了问题，请稍后再试。"
        err_type = type(e).__name__
        err_str = str(e).lower()

        # API 认证/额度类错误
        if any(k in err_str for k in ("authentication", "unauthorized", "invalid api key", "incorrect api key", "quota", "insufficient_quota", "billing", "credit")):
            err_msg = "抱歉，AI 服务暂时不可用（API 密钥无效或额度不足），请联系管理员检查配置。"
        # 网络/超时类错误
        elif any(k in err_str for k in ("timeout", "connection", "network", "resolve", "refused")):
            err_msg = "抱歉，连接 AI 服务超时，请检查网络后重试。"
        # 模型/参数类错误
        elif any(k in err_str for k in ("model", "not found", "does not exist", "deprecated")):
            err_msg = f"抱歉，当前配置的 AI 模型不可用（{err_type}），请联系管理员检查模型配置。"

        yield (
            AIMessage(content=err_msg),
            {"langgraph_node": "career_agent", "streaming": True},
        )
    finally:
        _reset_context_vars(resets)
