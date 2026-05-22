"""单 Agent 定义。

runner.py 负责构建动态系统提示词并设置 ContextVars。
"""
from __future__ import annotations

from langchain.agents import create_agent as create_tool_agent

from agent.llm import get_chat_model
from agent.tools.registry import ALL_TOOLS
from agent.tools.filter import filter_tools_by_intent

# ── 系统提示词 ─────────────────────────────────────────────────────────────
# 第 1、2 部分固定；第 3 部分 ({CONTEXT}) 由 runner.py 在每次请求时动态注入

SYSTEM_PROMPT_TEMPLATE = """你是"职途智析"的 AI 教练，帮助计算机专业学生做职业决策。
直接回答，不废话，像有经验的学长。

## 强制规则
- 用户询问任何关于自己的信息时，必须调用对应工具获取最新数据，禁止凭记忆或猜测回答
- 用户问画像/技能/项目/适合什么 → 调 get_user_profile
- 用户问推荐方向/系统推荐 → 调 get_recommended_roles
- 用户问职业报告/发展报告/分析报告 → 调 get_career_report
- 用户问市场/前景/薪资/时机 → 调 get_market_signal
- 用户问目标岗位 → 调 get_career_goal
- 用户粘了JD文本（≥50字）→ 调 diagnose_jd
- 用户说记得/上次/之前说过 → 调 get_memory_recall
- 不要在回复中解释你要调用什么工具
- 搜不到数据如实说，不要编造
- 写操作执行后，在回复里自然提一句"已帮你记录"
- 禁止改写或省略回复中的 [COACH_RESULT_ID:N] 和 [ACTION_TAKEN:...] 标记

## 教练技能库
{SKILLS}

## 当前用户状态
{CONTEXT}"""


def create_agent():
    """创建当前聊天主链使用的单 Agent。

    system_prompt=None 表示由 runner.py 在调用 agent.astream() 前
    以 SystemMessage 形式注入完整渲染后的提示词。

    middleware=filter_tools_by_intent 实现按需加载：
    每次模型调用前根据用户消息过滤工具列表，只保留相关工具。
    """
    model = get_chat_model(temperature=0.5)
    return create_tool_agent(
        model=model,
        tools=ALL_TOOLS,
        name="career_agent",
        middleware=[filter_tools_by_intent],
    )
