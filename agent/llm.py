"""
agent/llm.py — 从 core.llm 重新导出，保持向后兼容。

实际实现在 backend/llm.py 中。
agent 代码可继续使用 `from agent.llm import ...`，无需修改。
"""
from core.llm import (  # noqa: F401
    get_chat_model,
    get_env_int,
    get_env_str,
    get_llm_client,
    get_model,
    llm_chat,
    load_env,
    parse_json_response,
)
