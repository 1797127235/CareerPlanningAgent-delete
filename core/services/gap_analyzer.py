"""GapAnalyzer — skill gap analysis for role matching.

Uses the same skill-gap logic as the report pipeline for consistent results.
"""
from __future__ import annotations

import hashlib
import json


def profile_hash(profile_data: dict) -> str:
    """Generate a stable hash of profile data for cache invalidation."""
    key_data = json.dumps({
        "skills": sorted(s.get("name", "") if isinstance(s, dict) else str(s) for s in profile_data.get("skills", [])),
        "projects": [p.get("name", "") if isinstance(p, dict) else str(p) for p in profile_data.get("projects", [])],
    }, ensure_ascii=False)
    return hashlib.md5(key_data.encode()).hexdigest()[:12]


def analyze_gaps(
    profile_data: dict,
    role_id: str,
    role_label: str,
    topics: list,
) -> dict:
    """Analyze skill gaps between user profile and target role.

    Leverages report-pipeline's _build_skill_gap for rich, market-aware analysis.
    Falls back to topic-based keyword matching if graph node data is unavailable.
    """
    from core.services.graph.query import get_graph_nodes
    from core.services.report.skill_gap import _build_skill_gap
    from core.services.report.data import _user_skill_set

    graph_nodes = get_graph_nodes()
    node = graph_nodes.get(role_id, {})

    if node and node.get("skill_tiers"):
        # Rich analysis using report-pipeline logic
        user_skills = _user_skill_set(profile_data)
        # Scan project/internship text for practiced skills
        practiced: set[str] = set()
        for p in profile_data.get("projects", []):
            text = (p.get("name", "") + " " + p.get("description", "")) if isinstance(p, dict) else str(p)
            for skill in user_skills:
                if skill.lower() in text.lower():
                    practiced.add(skill.lower())
        for i in profile_data.get("internships", []):
            text = (i.get("role", "") + " " + i.get("highlights", "")) if isinstance(i, dict) else str(i)
            for skill in user_skills:
                if skill.lower() in text.lower():
                    practiced.add(skill.lower())

        gap_result = _build_skill_gap(profile_data, node, practiced=practiced)

        mastered = []
        for ms in gap_result.get("matched_skills", [])[:10]:
            status_label = {
                "completed": "项目经历中有完整体现",
                "practiced": "项目经历中有体现",
                "claimed": "画像中已声明",
            }.get(ms.get("status", ""), "已掌握")
            mastered.append({"module": ms["name"], "reason": status_label})

        gaps = []
        for mg in gap_result.get("top_missing", [])[:8]:
            tier = mg.get("tier", "")
            priority = "high" if tier == "core" else ("medium" if tier == "important" else "low")
            gaps.append({
                "module": mg["name"],
                "reason": f"{tier}技能，当前画像中未体现，建议补充相关项目或课程",
                "priority": priority,
            })

        total_matched = gap_result.get("core", {}).get("matched", 0) + \
                        gap_result.get("important", {}).get("matched", 0) + \
                        gap_result.get("bonus", {}).get("matched", 0)
        total_skills = gap_result.get("core", {}).get("total", 0) + \
                       gap_result.get("important", {}).get("total", 0) + \
                       gap_result.get("bonus", {}).get("total", 0)
        coverage = round(total_matched / max(1, total_skills) * 100)

        return {
            "role_id": role_id,
            "label": role_label,
            "mastered": mastered,
            "gaps": gaps,
            "mastered_count": len(mastered),
            "gap_count": len(gaps),
            "coverage_pct": coverage,
            "failed": False,
        }

    # Fallback: topic-based keyword matching (when graph node has no skill_tiers)
    user_skills_raw = profile_data.get("skills", [])
    user_skills: set[str] = set()
    for s in user_skills_raw:
        if isinstance(s, dict):
            user_skills.add(s.get("name", "").lower().strip())
        elif isinstance(s, str):
            user_skills.add(s.lower().strip())

    # Also scan project/internship text for implied skills
    implied_text = ""
    for p in profile_data.get("projects", []):
        if isinstance(p, dict):
            implied_text += " " + (p.get("name", "") + " " + p.get("description", ""))
        elif isinstance(p, str):
            implied_text += " " + p
    for i in profile_data.get("internships", []):
        if isinstance(i, dict):
            implied_text += " " + (i.get("role", "") + " " + i.get("highlights", ""))
        elif isinstance(i, str):
            implied_text += " " + i
    implied_text = implied_text.lower()

    mastered = []
    gaps = []
    topic_names = [t.get("name", "") if isinstance(t, dict) else t for t in topics if t]

    for topic in topic_names:
        topic_lower = topic.lower().strip()
        has_it = any(
            topic_lower == us or topic_lower in us or us in topic_lower
            for us in user_skills
        )
        if not has_it and len(topic_lower) >= 3:
            has_it = topic_lower in implied_text

        if has_it:
            mastered.append({
                "module": topic,
                "reason": "画像中已声明或项目经历中有体现",
            })
        else:
            gaps.append({
                "module": topic,
                "reason": "当前画像中未体现，建议补充相关项目或课程",
                "priority": "high" if len(gaps) < 3 else "medium",
            })

    total = len(mastered) + len(gaps)
    return {
        "role_id": role_id,
        "label": role_label,
        "mastered": mastered,
        "gaps": gaps,
        "mastered_count": len(mastered),
        "gap_count": len(gaps),
        "coverage_pct": round(len(mastered) / max(1, total) * 100),
        "failed": False,
    }
