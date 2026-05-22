"""Skill loader — 按需加载，避免全量注入污染 LLM 上下文。

参考 Lumen 设计：
1. 始终注入轻量目录（name + description 摘要）
2. 根据用户消息匹配最相关的 1-2 个 skill，注入完整内容
3. Anthropic 的"全量信任"机制对长提示词不友好，改为显式匹配
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import yaml

logger = logging.getLogger(__name__)


@dataclass
class Skill:
    name: str
    description: str
    body: str
    path: Path  # skill 目录路径，供未来 progressive disclosure 使用


class SkillLoader:
    _skills: list[Skill] = []
    _loaded: bool = False

    @classmethod
    def load_all(cls, skills_dir: Optional[Path] = None) -> None:
        """扫描 skills_dir 下所有子目录，加载其中的 SKILL.md。"""
        if skills_dir is None:
            skills_dir = Path(__file__).parent

        skills: list[Skill] = []
        for sub_dir in sorted(skills_dir.iterdir()):
            if not sub_dir.is_dir() or sub_dir.name.startswith("__"):
                continue
            skill_file = sub_dir / "SKILL.md"
            if not skill_file.exists():
                continue
            try:
                text = skill_file.read_text(encoding="utf-8")
                if not text.startswith("---"):
                    logger.warning("Skill %s missing frontmatter", sub_dir.name)
                    continue
                parts = text.split("---", 2)
                if len(parts) < 3:
                    continue
                frontmatter = yaml.safe_load(parts[1]) or {}
                body = parts[2].strip()
                skills.append(Skill(
                    name=frontmatter.get("name", sub_dir.name),
                    description=frontmatter.get("description", "").strip(),
                    body=body,
                    path=sub_dir,
                ))
            except Exception as e:
                logger.warning("Failed to load skill %s: %s", sub_dir.name, e)

        cls._skills = skills
        cls._loaded = True
        logger.info("SkillLoader loaded %d skills: %s",
                    len(skills), [s.name for s in skills])

    @classmethod
    def all_skills(cls) -> list[Skill]:
        if not cls._loaded:
            cls.load_all()
        return cls._skills

    # ── 目录摘要（始终注入）─────────────────────────────────────────────

    @classmethod
    def build_skills_summary(cls) -> str:
        """生成轻量目录，只含 name + 截断的 description。"""
        skills = cls.all_skills()
        if not skills:
            return "（尚无可用 skill）"

        parts = ["以下是你可用的技能目录（只显示名称和简介，详细规则按需激活）："]
        for s in skills:
            desc = s.description
            # 截断过长的 description，保留核心信息
            if len(desc) > 200:
                desc = desc[:200] + "…"
            parts.append(f"- `{s.name}`：{desc}")
        return "\n".join(parts)

    # ── 按需检测（根据用户消息匹配）─────────────────────────────────────

    @classmethod
    def detect_skills(cls, user_input: str) -> list[str]:
        """根据用户消息检测最匹配的 1-2 个 skill name。

        匹配策略：
        1. 提取用户消息中的关键词（2 字以上的中/英文词）
        2. 和每个 skill 的 description 做关键词命中计数
        3. skill name 中的关键词（如 market-signal 中的 market/signal）额外加分
        4. 取分数最高的 1-2 个
        """
        if not user_input or not user_input.strip():
            return []

        user_lower = user_input.lower()
        skills = cls.all_skills()

        # 提取用户消息中的候选关键词
        user_words = set(re.findall(r"[a-zA-Z0-9\u4e00-\u9fff]{2,}", user_lower))
        if not user_words:
            return []

        scores: list[tuple[str, int]] = []
        for s in skills:
            score = 0
            desc_lower = s.description.lower()

            # 基础匹配：用户关键词在 description 中出现
            for word in user_words:
                if word in desc_lower:
                    score += 1

            # skill name 关键词加分（如 coach-market-signal 中的 market/signal）
            name_parts = re.split(r"[-_]", s.name.replace("coach-", ""))
            for part in name_parts:
                if len(part) >= 2 and part in user_lower:
                    score += 3

            # 特定强信号加分
            strong_signals = {
                "coach-exploring-guide": ["推荐", "方向", "报告", "适合", "对比", "介绍", "探索"],
                "coach-market-signal": ["前景", "市场", "薪资", "需求", "时机", "卷", "替代"],
                "coach-resume-review": ["简历", "cv", "履历"],
                "coach-interview-prep": ["面试", "面经", "笔试", "一面", "二面"],
                "coach-emotional-support": ["焦虑", "崩溃", "累", "压力", "想哭", "撑不住"],
                "coach-direction-scaffold": ["迷茫", "不知道", "没方向", "无所谓"],
                "coach-decision-socratic": ["纠结", "犹豫", "选", "vs", "还是", "对比"],
                "coach-concern-direct": ["担心", "害怕", "怎么办", "够不够", "有没有希望"],
                "coach-request-deliver": ["帮我", "给我", "梳理", "分析", "总结", "看看"],
                "coach-progress-report": ["做完", "完成了", "刷完", "读完", "跑了", "考了"],
            }
            signals = strong_signals.get(s.name, [])
            for sig in signals:
                if sig in user_lower:
                    score += 5

            if score > 0:
                scores.append((s.name, score))

        scores.sort(key=lambda x: x[1], reverse=True)
        matched = [name for name, _ in scores[:2]]

        if matched:
            logger.info("Skill match: user_input='%s...' -> %s",
                        user_input[:40], matched)
        return matched

    # ── 按需加载（注入完整内容）─────────────────────────────────────────

    @classmethod
    def load_skills_for_context(cls, skill_names: list[str]) -> str:
        """将指定 skill 的完整内容加载为 prompt 片段（剥除 frontmatter）。"""
        skills = cls.all_skills()
        skill_map = {s.name: s for s in skills}

        parts: list[str] = []
        for name in skill_names:
            s = skill_map.get(name)
            if s:
                parts.append(f"### Skill: `{s.name}`")
                parts.append(f"**适用场景**：{s.description}")
                parts.append("")
                parts.append(s.body)
                parts.append("")

        return "\n".join(parts) if parts else ""


# ═══════════════════════════════════════════════════════════════════════
#  对外接口 — 供 runner.py 调用
# ═══════════════════════════════════════════════════════════════════════


def format_skills_for_prompt(user_input: str = "") -> str:
    """构建注入系统提示词的 SKILLS 部分。

    策略：
    1. 始终注入轻量目录（所有 skill 的 name + description 摘要）
    2. 根据用户消息匹配 1-2 个最相关的 skill，注入完整内容
    """
    summary = SkillLoader.build_skills_summary()
    matched = SkillLoader.detect_skills(user_input) if user_input else []
    context = SkillLoader.load_skills_for_context(matched)

    parts = [summary]
    if context:
        parts.append("")
        parts.append("---")
        parts.append("")
        parts.append("## 当前激活的技能（基于用户消息匹配，请严格遵循这些 skill 的规则和工具调用指令）")
        parts.append("")
        parts.append(context)

    return "\n".join(parts)
