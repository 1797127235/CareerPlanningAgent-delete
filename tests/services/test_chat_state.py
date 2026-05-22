"""Tests for chat state hydration used by the single-agent chat flow."""
from __future__ import annotations

import json
from types import SimpleNamespace
from typing import cast
from unittest.mock import patch

from sqlalchemy.orm import Session

from core.models import (
    ActionPlanV2,
    ActionProgress,
    CareerGoal,
    JDDiagnosis,
    JobApplication,
    Profile,
    ProjectRecord,
    User,
)
from core.services.chat.state import hydrate_state


class _FakeQuery:
    def __init__(self, *, first_result=None, all_result=None):
        self._first_result = first_result
        self._all_result = all_result if all_result is not None else []

    def filter(self, *args, **kwargs):
        return self

    def filter_by(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def first(self):
        return self._first_result

    def all(self):
        return list(self._all_result)


class _FakeDB:
    def __init__(self):
        self.profile = SimpleNamespace(
            id=11,
            updated_at="2026-01-01",
            profile_json=json.dumps(
                {
                    "skills": [{"name": "Python", "level": "advanced"}],
                    "education": {"degree": "本科", "major": "计算机"},
                },
                ensure_ascii=False,
            ),
            cached_recs_json=json.dumps(
                {
                    "data": {
                        "recommendations": [
                            {"label": "后端开发", "role_id": "backend"},
                            {"label": "数据开发", "role_id": "data"},
                        ]
                    }
                },
                ensure_ascii=False,
            ),
            coach_memo="用户更偏好后端",
        )
        self.goal = SimpleNamespace(target_label="后端工程师", target_node_id="cs_backend_java", target_zone="safe")
        self.latest_jd = SimpleNamespace(
            match_score=78,
            jd_title="后端实习生",
            result_json=json.dumps({"gap_skills": [{"skill": "Redis"}]}, ensure_ascii=False),
        )
        self.projects = [
            SimpleNamespace(name="项目A", status="in_progress", skills_used=["Python", "FastAPI"], description="做接口"),
        ]
        self.pursuits = [
            SimpleNamespace(company="字节跳动", position="后端实习生", status="applied"),
        ]
        self.latest_plan = SimpleNamespace(profile_id=11, report_key="r1", generated_at="2026-01-01", stage=1, content={})
        self.plan_stages = [
            SimpleNamespace(stage=1, content={"stage": 1, "label": "打基础", "items": [{"id": "a1", "text": "刷题"}, {"id": "a2", "text": "项目"}]}),
            SimpleNamespace(stage=2, content={"stage": 2, "label": "投递", "items": [{"id": "b1", "text": "投简历"}]}),
        ]
        self.progress = SimpleNamespace(checked={"a1": True})
        self.refreshed = []

    def refresh(self, obj):
        self.refreshed.append(obj)

    def query(self, model):
        mapping = {
            Profile: _FakeQuery(first_result=self.profile),
            CareerGoal: _FakeQuery(first_result=self.goal),
            JDDiagnosis: _FakeQuery(first_result=self.latest_jd),
            ProjectRecord: _FakeQuery(all_result=self.projects),
            JobApplication: _FakeQuery(all_result=self.pursuits),
            ActionPlanV2: _FakeQuery(first_result=self.latest_plan, all_result=self.plan_stages),
            ActionProgress: _FakeQuery(first_result=self.progress),
        }
        return mapping[model]


class TestHydrateState:
    def test_hydrate_state_builds_rich_state(self):
        user = cast(User, SimpleNamespace(id=1))
        db = _FakeDB()

        with patch("core.services.chat.state.determine_stage", return_value="focusing"):
            state = hydrate_state(user, cast(Session, db))

        assert state["user_id"] == 1
        assert state["profile_id"] == 11
        assert state["user_profile"]["skills"][0]["name"] == "Python"
        assert state["career_goal"] == {
            "label": "后端工程师",
            "node_id": "cs_backend_java",
            "zone": "safe",
        }
        assert state["current_node_id"] == "cs_backend_java"
        assert state["user_stage"] == "focusing"
        assert state["last_diagnosis"]["jd_title"] == "后端实习生"
        assert state["last_diagnosis"]["gap_skills"] == [{"skill": "Redis"}]
        assert state["recommended_labels"] == ["后端开发", "数据开发"]
        assert len(state["recommended_data"]) == 2
        assert state["coach_memo"] == "用户更偏好后端"
        assert state["growth_context"]["projects"][0]["name"] == "项目A"
        assert state["growth_context"]["pursuits"][0]["company"] == "字节跳动"
        assert state["action_plan_context"]["stages"][0] == {
            "stage": 1,
            "label": "打基础",
            "total": 2,
            "done": 1,
            "pending_preview": ["项目"],
        }
        assert state["action_plan_context"]["stages"][1] == {
            "stage": 2,
            "label": "投递",
            "total": 1,
            "done": 0,
            "pending_preview": ["投简历"],
        }
        assert db.refreshed == [db.profile]
