# -*- coding: utf-8 -*-
"""ProfileService facade — delegates to sub-modules by domain."""
from __future__ import annotations

from core.services.profile import sjt


class ProfileService:
    """Static facade for profile analysis utilities."""

    @staticmethod
    def compute_quality(profile_data: dict) -> dict:
        """Deterministic quality scoring from profile data."""
        _QUALITY_LEVEL_WEIGHT = {
            "expert": 1.0, "advanced": 1.0,
            "proficient": 0.7, "intermediate": 0.7,
            "familiar": 0.3, "beginner": 0.1,
        }

        skills = profile_data.get("skills", [])
        knowledge_areas = profile_data.get("knowledge_areas", [])
        projects = profile_data.get("projects", [])
        has_education = bool(profile_data.get("education"))
        has_experience = profile_data.get("experience_years", 0) > 0

        completeness = min(1.0, (
            (0.3 if skills else 0)
            + (0.2 if knowledge_areas else 0)
            + (0.2 if has_experience else 0)
            + (0.2 if has_education else 0)
            + (0.1 if projects else 0)
        ))

        skill_score = sum(
            _QUALITY_LEVEL_WEIGHT.get(s.get("level", "beginner"), 0.1)
            for s in skills
        )
        skill_component = min(0.4, skill_score * 0.04)
        breadth_component = min(0.2, len(knowledge_areas) * 0.03)
        project_component = min(0.15, len(projects) * 0.05)
        experience_component = min(
            0.15, profile_data.get("experience_years", 0) * 0.05
        )
        education_component = 0.1 if has_education else 0

        raw_competitiveness = (
            skill_component + breadth_component + project_component
            + experience_component + education_component
        )
        competitiveness = min(1.0, max(raw_competitiveness, 0.05 if skills else 0))

        soft = profile_data.get("soft_skills", {})
        dimensions: list[dict] = []
        if soft.get("_version") == 2:
            dim_labels = {
                "communication": "沟通能力",
                "learning": "学习能力",
                "collaboration": "协作能力",
            }
        else:
            dim_labels = {
                "innovation": "创新能力",
                "learning": "学习能力",
                "resilience": "抗压能力",
                "communication": "沟通能力",
                "internship": "实习能力",
            }
        for key, label in dim_labels.items():
            val = soft.get(key)
            if isinstance(val, dict):
                score = val.get("score", 50)
            elif isinstance(val, (int, float)):
                score = val
            else:
                continue
            dimensions.append({"key": key, "label": label, "score": int(score)})

        return {
            "completeness": round(completeness, 2),
            "competitiveness": round(competitiveness, 2),
            "dimensions": dimensions,
        }

    @staticmethod
    def generate_sjt_questions(profile_data: dict) -> list[dict]:
        return sjt.generate_sjt_questions(profile_data)

    @staticmethod
    def score_sjt_v2(answers: list[dict], questions: list[dict]) -> dict:
        return sjt.score_sjt_v2(answers, questions)

    @staticmethod
    def generate_sjt_advice(
        dimensions: dict,
        answers: list[dict],
        questions: list[dict],
        profile_data: dict,
    ) -> dict[str, str]:
        return sjt.generate_sjt_advice(dimensions, answers, questions, profile_data)
