"""Coach 记忆层 — 封装 Mem0，对外提供 add/search 接口。

配置：
- LLM: DeepSeek (OpenAI-compatible endpoint，通过 LLM_BASE_URL)
- Embedding: DashScope text-embedding-v3（固定走阿里云，不随 LLM_BASE_URL 漂移）
- 存储: 本地 Qdrant embedded 模式
"""
from __future__ import annotations

import logging
import os
from typing import Optional

from dotenv import load_dotenv
from mem0 import Memory

from backend2.core.config import (
    DASHSCOPE_API_KEY,
    LLM_BASE_URL,
    MEM0_EMBEDDING_MODEL,
    MEM0_LLM_MODEL,
    MEM0_LLM_TEMPERATURE,
)

# 防御性加载 .env，避免 import 顺序导致读不到环境变量
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"), override=False)

logger = logging.getLogger(__name__)

_memory: Optional[Memory] = None


def _build_config() -> dict:
    """构造 Mem0 配置。

    LLM 和 Embedding 分离：
    - LLM 跟随项目主配置（当前是 DeepSeek），用于记忆提取/总结
    - Embedding 固定走 DashScope，因为 text-embedding-v3 是阿里云专有模型
    """
    llm_base_url = LLM_BASE_URL
    llm_model = MEM0_LLM_MODEL
    embedding_model = MEM0_EMBEDDING_MODEL
    temperature = MEM0_LLM_TEMPERATURE

    # Embedding 必须走 DashScope（text-embedding-v3 只有阿里云提供）
    dashscope_base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    # LLM 和 Embedding 用不同的 key：LLM 跟随 base_url，Embedding 固定走 DashScope
    if "deepseek" in llm_base_url.lower():
        llm_api_key = os.getenv("OPENAI_API_KEY") or DASHSCOPE_API_KEY
    else:
        llm_api_key = DASHSCOPE_API_KEY or os.getenv("OPENAI_API_KEY", "")
    embed_api_key = DASHSCOPE_API_KEY or os.getenv("OPENAI_API_KEY", "")

    return {
        "llm": {
            "provider": "openai",
            "config": {
                "model": llm_model,
                "api_key": llm_api_key,
                "openai_base_url": llm_base_url,
                "temperature": temperature,
            }
        },
        "embedder": {
            "provider": "openai",
            "config": {
                "model": embedding_model,
                "api_key": embed_api_key,
                "openai_base_url": dashscope_base_url,
            }
        },
        "vector_store": {
            "provider": "qdrant",
            "config": {
                "collection_name": "coach_memory",
                "path": "./data/mem0_qdrant",  # 本地 embedded 模式
            }
        },
    }


def get_memory() -> Memory:
    """Lazy init Mem0 实例（进程级单例）。"""
    global _memory
    if _memory is None:
        try:
            _memory = Memory.from_config(_build_config())
            logger.info("Mem0 initialized with DashScope")
        except Exception:
            logger.exception("Mem0 init failed")
            raise
    return _memory


def add_conversation(user_id: int, conversation: str) -> None:
    """从对话中抽取记忆（Mem0 自动做 LLM extraction + 去重 + 冲突处理）。"""
    try:
        mem = get_memory()
        mem.add(conversation, user_id=str(user_id))
    except Exception:
        logger.exception("Failed to add memory for user %d", user_id)


def search_user_context(user_id: int, query: str, limit: int = 5) -> list[str]:
    """检索用户长期记忆，返回可直接注入提示词的纯文本列表。"""
    if not query or not query.strip():
        return []

    try:
        mem = get_memory()
        results = mem.search(query=query, user_id=str(user_id), limit=limit) or []
    except Exception:
        logger.exception("Failed to search memory for user %d", user_id)
        return []

    normalized: list[str] = []
    for item in results:
        if isinstance(item, str):
            text = item.strip()
        elif isinstance(item, dict):
            text = str(
                item.get("memory")
                or item.get("text")
                or item.get("content")
                or ""
            ).strip()
        else:
            text = str(item).strip()

        if text:
            normalized.append(text)

    return normalized


def seed_profile_memory(user_id: int, profile_data: dict) -> None:
    """把画像摘要作为种子记忆喂给 Mem0，让 Mem0 从一开始就了解用户。

    在画像创建/更新时调用。Mem0 内部会去重，重复调用不会制造垃圾记忆。
    """
    if not profile_data:
        return

    # 构建画像摘要文本
    parts = ["[画像种子] 用户基础画像信息："]

    name = profile_data.get("name", "")
    if name:
        parts.append(f"姓名：{name}")

    goal = profile_data.get("career_goal")
    if isinstance(goal, dict) and goal.get("label"):
        parts.append(f"目标岗位：{goal['label']}")

    job_target = profile_data.get("job_target_text", "")
    if job_target:
        parts.append(f"求职意向：{job_target}")

    skills = profile_data.get("skills", [])
    if skills:
        skill_names = [s["name"] for s in skills if isinstance(s, dict) and s.get("name")]
        parts.append(f"技能：{', '.join(skill_names[:15])}")

    edu = profile_data.get("education", [])
    if edu:
        first = edu[0] if isinstance(edu, list) else edu
        if isinstance(first, dict):
            school = first.get("school", "")
            degree = first.get("degree", "")
            major = first.get("major", "")
            if school or degree or major:
                parts.append(f"教育：{school} {degree} {major}".strip())

    projects = profile_data.get("projects", [])
    if projects:
        proj_names = [p["name"] for p in projects if isinstance(p, dict) and p.get("name")]
        parts.append(f"项目：{', '.join(proj_names[:5])}")

    internships = profile_data.get("internships", [])
    if internships:
        intern_names = [f"{i['company']}({i['role']})" for i in internships if isinstance(i, dict) and i.get("company")]
        parts.append(f"实习：{', '.join(intern_names[:3])}")

    tags = profile_data.get("tags", [])
    if tags:
        parts.append(f"标签：{', '.join(tags[:10])}")

    strengths = profile_data.get("strengths", [])
    if strengths:
        parts.append(f"优势：{', '.join(strengths[:5])}")

    weaknesses = profile_data.get("weaknesses", [])
    if weaknesses:
        parts.append(f"待提升：{', '.join(weaknesses[:5])}")

    constraints = profile_data.get("constraints", [])
    if constraints:
        labels = [c.get("label", "") for c in constraints if isinstance(c, dict) and c.get("label")]
        parts.append(f"约束：{', '.join(labels[:5])}")

    preferences = profile_data.get("preferences", [])
    if preferences:
        labels = [p.get("label", "") for p in preferences if isinstance(p, dict) and p.get("label")]
        parts.append(f"偏好：{', '.join(labels[:5])}")

    summary = "\n".join(parts)
    try:
        mem = get_memory()
        mem.add(summary, user_id=str(user_id))
        logger.info("Seeded profile memory for user %d", user_id)
    except Exception:
        logger.exception("Failed to seed profile memory for user %d", user_id)


def migrate_legacy_memo(user_id: int, legacy_text: str) -> None:
    """一次性迁移：把老的 coach_memo 字符串塞进 Mem0。幂等（Mem0 内部去重）。"""
    if not legacy_text or not legacy_text.strip():
        return
    try:
        mem = get_memory()
        mem.add(f"[历史备忘录] {legacy_text}", user_id=str(user_id))
        logger.info("Migrated legacy memo for user %d (len=%d)", user_id, len(legacy_text))
    except Exception:
        logger.exception("Legacy memo migration failed for user %d", user_id)
