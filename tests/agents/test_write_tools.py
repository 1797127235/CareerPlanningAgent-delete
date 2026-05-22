"""Tests for agent/tools/write_tools.py against the current single-agent design."""
from __future__ import annotations

from unittest.mock import MagicMock, patch


def _set_user(user_id: int | None):
    from agent.tools.write_tools import _ctx_user_id

    return _ctx_user_id.set(user_id)


def _reset_user(token) -> None:
    from agent.tools.write_tools import _ctx_user_id

    _ctx_user_id.reset(token)


class TestAddGrowthEntry:
    def test_no_user_id_returns_error(self):
        from agent.tools.write_tools import add_growth_entry

        token = _set_user(None)
        try:
            result = add_growth_entry.invoke({"type": "study", "title": "Redis", "skills": []})
        finally:
            _reset_user(token)

        assert "ACTION_TAKEN" not in result

    def test_happy_path_returns_action_taken(self):
        from agent.tools.write_tools import add_growth_entry

        mock_db = MagicMock()
        token = _set_user(1)
        try:
            with patch("core.db.SessionLocal", return_value=mock_db):
                result = add_growth_entry.invoke({
                    "type": "study",
                    "title": "Redis AOF 持久化",
                    "skills": ["Redis"],
                    "hours": 2.0,
                })
        finally:
            _reset_user(token)

        assert "[ACTION_TAKEN:growth_entry:" in result
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()


class TestSetCareerGoal:
    def test_no_profile_returns_prompt(self):
        from agent.tools.write_tools import set_career_goal

        mock_db = MagicMock()
        profile_query = MagicMock()
        profile_query.filter.return_value.first.return_value = None
        mock_db.query.side_effect = [profile_query]

        token = _set_user(1)
        try:
            with patch("core.db.SessionLocal", return_value=mock_db):
                result = set_career_goal.invoke({"node_id": "cs_backend", "label": "后端工程师"})
        finally:
            _reset_user(token)

        assert "画像" in result
        assert "ACTION_TAKEN" not in result

    def test_happy_path_creates_goal(self):
        from agent.tools.write_tools import set_career_goal

        mock_db = MagicMock()
        mock_profile = MagicMock()
        mock_profile.id = 42

        profile_query = MagicMock()
        profile_query.filter.return_value.first.return_value = mock_profile
        goal_query = MagicMock()
        goal_query.filter_by.return_value.first.return_value = None
        mock_db.query.side_effect = [profile_query, goal_query]

        token = _set_user(1)
        try:
            with patch("core.db.SessionLocal", return_value=mock_db):
                result = set_career_goal.invoke({"node_id": "cs_backend", "label": "后端工程师"})
        finally:
            _reset_user(token)

        assert "[ACTION_TAKEN:goal_set:" in result
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()


class TestTrackApplication:
    def test_happy_path_returns_action_taken(self):
        from agent.tools.write_tools import track_application

        mock_db = MagicMock()
        token = _set_user(1)
        try:
            with patch("core.db.SessionLocal", return_value=mock_db):
                result = track_application.invoke({
                    "company": "字节跳动",
                    "role": "后端工程师",
                    "status": "applied",
                })
        finally:
            _reset_user(token)

        assert "[ACTION_TAKEN:application:" in result
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()


class TestDiagnoseJdWriteTool:
    def test_no_user_id_returns_error(self):
        from agent.tools.write_tools import diagnose_jd

        token = _set_user(None)
        try:
            result = diagnose_jd.invoke({"jd_text": "要求熟悉 Python 和 Redis"})
        finally:
            _reset_user(token)

        assert "COACH_RESULT_ID" not in result

    def test_no_profile_returns_prompt(self):
        from agent.tools.write_tools import diagnose_jd

        mock_db = MagicMock()
        query = MagicMock()
        query.filter.return_value.order_by.return_value.first.return_value = None
        mock_db.query.return_value = query

        token = _set_user(1)
        try:
            with patch("core.db.SessionLocal", return_value=mock_db):
                result = diagnose_jd.invoke({"jd_text": "要求熟悉 Python 和 Redis"})
        finally:
            _reset_user(token)

        assert "画像" in result
        assert "COACH_RESULT_ID" not in result

    def test_happy_path_returns_result_marker(self):
        from agent.tools.write_tools import diagnose_jd

        mock_db = MagicMock()
        profile_row = MagicMock()
        profile_row.profile_json = '{"skills": [{"name": "Python"}]}'
        query = MagicMock()
        query.filter.return_value.order_by.return_value.first.return_value = profile_row
        mock_db.query.return_value = query

        diagnosis = {
            "match_score": 82,
            "matched_skills": ["Python"],
            "gap_skills": [{"skill": "Redis"}],
            "jd_title": "后端工程师",
        }

        token = _set_user(1)
        try:
            with patch("core.db.SessionLocal", return_value=mock_db):
                with patch("core.services.jd_service.JDService.diagnose", return_value=diagnosis):
                    with patch("agent.tools.jd_tools._save_jd_coach_result", return_value=123):
                        result = diagnose_jd.invoke({"jd_text": "要求熟悉 Python 和 Redis"})
        finally:
            _reset_user(token)

        assert "JD匹配度: 82%" in result
        assert "[COACH_RESULT_ID:123]" in result
