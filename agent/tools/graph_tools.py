"""单 Agent 使用的图谱查询工具。"""
from __future__ import annotations

from langchain_core.tools import tool


@tool
def search_jobs(keyword: str) -> str:
    """按关键词搜索岗位图谱中的岗位节点，返回匹配的岗位列表。"""
    try:
        from core.services.graph import GraphService

        svc = GraphService()
        svc.load()
        results = svc.search_nodes(keyword)
    except Exception as e:
        return f"搜索岗位时出错：{e}"

    if not results:
        return f"未找到与'{keyword}'相关的岗位。"

    lines: list[str] = []
    for r in results[:8]:
        lines.append(f"- {r.get('label', '?')}（{r.get('role_family', '')}）")
    total = len(results)
    shown = min(total, 8)
    header = f"找到 {total} 个相关岗位" + (f"（显示前 {shown} 个）：" if total > 8 else "：")
    return header + "\n" + "\n".join(lines)


@tool
def get_job_detail(job_name: str) -> str:
    """查询岗位图谱中指定岗位的详细信息，包括技能要求、AI影响评分等。"""
    try:
        from core.services.graph import GraphService

        svc = GraphService()
        svc.load()
        node = None
        for candidate in svc.search_nodes(job_name):
            if candidate.get("label", "").strip().lower() == job_name.strip().lower():
                node = candidate
                break
        if node is None:
            matches = svc.search_nodes(job_name)
            node = matches[0] if matches else None
    except Exception as e:
        return f"查询岗位详情时出错：{e}"

    if node is None:
        return f"未找到名为'{job_name}'的岗位。可以用搜索工具先查找。"

    lines = [f"【{node.get('label', job_name)}】"]

    # Description
    desc = node.get("description", "")
    if desc:
        lines.append(f"  简介: {desc}")

    lines.append(f"  职业族群: {node.get('role_family', 'N/A')}")

    # Core tasks
    tasks = node.get("core_tasks", [])
    if tasks:
        lines.append(f"  日常工作: {', '.join(tasks)}")

    # AI scores
    rp = node.get("replacement_pressure", node.get("ai_exposure"))
    hal = node.get("human_ai_leverage", node.get("human_premium"))
    zone = node.get("zone", "N/A")
    lines.append(f"  AI替代压力: {rp}/100（越低越安全）")
    lines.append(f"  人类杠杆: {hal}/100（越高说明AI越能增强你的能力）")
    lines.append(f"  安全区: {zone}")

    # Strategic fields
    market = node.get("market_insight", "")
    if market:
        lines.append(f"  市场洞察: {market}")

    ai_narrative = node.get("ai_impact_narrative", "")
    if ai_narrative:
        lines.append(f"  AI影响分析: {ai_narrative}")

    diff_advice = node.get("differentiation_advice", "")
    if diff_advice:
        lines.append(f"  差异化建议: {diff_advice}")

    employers = node.get("typical_employers", [])
    if employers:
        lines.append(f"  典型雇主: {', '.join(employers[:6])}")

    barrier = node.get("entry_barrier", "")
    if barrier:
        lines.append(f"  应届进入门槛: {barrier}")

    ceiling = node.get("career_ceiling", "")
    if ceiling:
        lines.append(f"  发展天花板: {ceiling}")

    projects = node.get("project_recommendations", [])
    if projects:
        for p in projects[:3]:
            if isinstance(p, dict):
                lines.append(f"  推荐项目: {p.get('name', '?')} — {p.get('why', '')}（难度: {p.get('difficulty', '?')}）")

    # Skills
    must_skills = node.get("must_skills", [])
    if must_skills:
        lines.append(f"  核心技能: {', '.join(must_skills[:10])}")

    # Promotion path
    promo = node.get("promotion_path", [])
    if promo:
        path_str = " -> ".join(p.get("title", "?") for p in promo)
        lines.append(f"  晋升路线: {path_str}")

    # Related majors
    majors = node.get("related_majors", [])
    if majors:
        lines.append(f"  相关专业: {', '.join(majors)}")

    return "\n".join(lines)


