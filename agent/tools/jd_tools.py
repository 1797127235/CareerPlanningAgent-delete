"""JD 诊断结果持久化辅助函数。"""
from __future__ import annotations

import json
import logging

logger = logging.getLogger(__name__)


def _save_jd_coach_result(
    jd_text: str, match_score: int, matched: list, gaps: list, jd_title: str,
    user_id: int | None = None,
    company: str = "",
    job_url: str = "",
) -> int | None:
    """将 JD 诊断保存为 CoachResult。返回结果 ID 或 None。"""
    try:
        from core.db import SessionLocal
        from core.models import CoachResult, JDDiagnosis

        db = SessionLocal()
        try:
            # 如果没有传 user_id，回退到最新的 JD 诊断记录
            if not user_id:
                latest = (
                    db.query(JDDiagnosis)
                    .order_by(JDDiagnosis.created_at.desc())
                    .first()
                )
                user_id = latest.user_id if latest else None
            if not user_id:
                return None

            # 构建显示标题：有公司名时优先用"公司 · 岗位"格式
            display_title = jd_title or (jd_text[:40] + "...")
            if company and jd_title and company not in jd_title:
                display_title = f"{company} · {jd_title}"

            coach_result = CoachResult(
                user_id=user_id,
                result_type="jd_diagnosis",
                title=display_title,
                summary=f"匹配度 {match_score}%，匹配 {len(matched)} 项技能，缺口 {len(gaps)} 项",
                detail_json=json.dumps({
                    "_structured": True,
                    "match_score": match_score,
                    "matched_skills": matched,
                    "gap_skills": gaps,
                    "jd_title": jd_title,
                    "company": company,
                    "job_url": job_url,
                }, ensure_ascii=False),
                metadata_json=json.dumps({
                    "match_score": match_score,
                    "gap_count": len(gaps),
                    "matched_count": len(matched),
                    "company": company,
                    "job_url": job_url,
                }, ensure_ascii=False),
            )
            db.add(coach_result)
            db.commit()
            return coach_result.id
        finally:
            db.close()
    except Exception:
        logger.exception("Failed to save JD CoachResult")
        return None
