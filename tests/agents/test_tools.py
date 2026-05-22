"""Tests for the current single-agent surface area."""
from __future__ import annotations

from typing import cast

from langchain_core.messages import HumanMessage
from langchain_core.tools import BaseTool


class TestRegistry:
    def test_registry_contains_expected_tools(self):
        from agent.tools.registry import ALL_TOOLS

        names = {tool.name for tool in ALL_TOOLS}
        assert names == {
            "get_user_profile",
            "get_career_goal",
            "get_recommended_roles",
            "get_market_signal",
            "get_memory_recall",
            "get_job_detail",
            "search_jobs",
            "get_dashboard_stats",
            "get_project_progress",
            "search_real_jd",
            "diagnose_jd",
            "add_growth_entry",
            "set_career_goal",
            "track_application",
        }
        assert all(isinstance(tool, BaseTool) for tool in ALL_TOOLS)


class TestAgentCreation:
    def test_create_agent(self):
        from agent.agent import create_agent

        agent = create_agent()
        assert agent is not None

    def test_runner_singleton(self):
        from agent.runner import _get_agent

        first = _get_agent()
        second = _get_agent()
        assert first is second


class TestToolExecution:
    def test_search_jobs_returns_string(self):
        from agent.tools.graph_tools import search_jobs

        result = search_jobs.invoke({"keyword": "前端"})
        assert isinstance(result, str)
        assert "前端" in result or "未找到" in result

    def test_get_job_detail_known(self):
        from agent.tools.graph_tools import get_job_detail

        result = get_job_detail.invoke({"job_name": "Java后端工程师"})
        assert isinstance(result, str)
        assert "Java后端工程师" in result or "未找到" in result


class TestContextSummary:
    def test_build_context_summary_for_early_turn(self):
        from agent.context import build_context_summary
        from agent.state import CareerState

        state = cast(CareerState, {
            "messages": [HumanMessage(content="你好")],
            "user_stage": "exploring",
            "user_profile": {
                "skills": [{"name": "Python", "level": "advanced"}],
                "education": {"degree": "本科", "major": "计算机"},
            },
            "recommended_labels": ["后端开发"],
        })
        summary = build_context_summary(state)

        assert "当前阶段" in summary
        assert "画像：已建立" in summary
        assert "Python" in summary


class TestState:
    def test_career_state_annotations_match_current_shape(self):
        from agent.state import CareerState

        annotations = CareerState.__annotations__
        assert "messages" in annotations
        assert "user_id" in annotations
        assert "profile_id" in annotations
        assert "user_profile" in annotations
        assert "career_goal" in annotations
        assert "current_node_id" in annotations
        assert "user_stage" in annotations
        assert "last_diagnosis" in annotations
        assert "coach_memo" in annotations
        assert "page_context" in annotations
        assert "tool_hint" in annotations
        assert "last_active_agent" in annotations
        assert "growth_context" in annotations
