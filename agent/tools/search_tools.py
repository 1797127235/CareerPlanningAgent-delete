"""JD 搜索工具 — 用 Tavily API 搜索互联网真实招聘 JD。

参考 JobMatch-AI (github.com/FelixNg1022/JobMatch-AI) 的三层过滤：
1. 聚合站域名黑名单
2. 文章/博客/列表页检测
3. JD 内容验证（包含岗位职责/任职要求关键词）
"""

from __future__ import annotations

import json
import logging
import re
from contextvars import ContextVar

from langchain_core.tools import tool

logger = logging.getLogger(__name__)

# 用于将用户画像注入搜索查询的 ContextVar
# 由 runner 在执行前设置
_injected_profile_for_search: ContextVar[dict | None] = ContextVar(
    '_injected_profile_for_search', default=None
)
_injected_goal_for_search: ContextVar[dict | None] = ContextVar(
    '_injected_goal_for_search', default=None
)


def _enrich_query_with_profile(query: str) -> str:
    """用画像中的技术关键词丰富通用查询。

    如果查询中没有特定技术词汇，则在前面加上目标岗位 + 核心技能。
    """
    # 检测查询中是否已包含特定技术关键词
    _TECH_KEYWORDS = (
        "c++", "java", "python", "go", "rust", "javascript", "typescript",
        "react", "vue", "android", "ios", "flutter",
        "后端", "前端", "全栈", "算法", "机器学习", "深度学习",
        "嵌入式", "运维", "测试", "安全", "数据", "dba",
        "ml", "ai", "nlp", "cv", "llm", "mlops",
    )
    query_lower = query.lower()
    has_tech = any(kw in query_lower for kw in _TECH_KEYWORDS)

    if has_tech:
        return query  # 查询已经足够具体

    # 从 ContextVar 获取
    profile = _injected_profile_for_search.get()
    goal = _injected_goal_for_search.get()

    hints: list[str] = []

    # 优先级 1：目标岗位（来自职业目标）
    if goal and goal.get("label"):
        hints.append(goal["label"])

    # 优先级 2：画像中的 primary_domain 或 job_target
    if profile:
        jt = profile.get("job_target") or profile.get("primary_domain") or ""
        if jt and jt not in hints:
            hints.append(jt)

        # 优先级 3：前 2 个技能
        skills = profile.get("skills", [])[:3]
        skill_names = []
        for s in skills:
            name = s.get("name", "") if isinstance(s, dict) else str(s)
            if name and len(name) <= 20:
                skill_names.append(name)
        if skill_names:
            hints.append(" ".join(skill_names))

    if hints:
        enriched = " ".join(hints) + " 校招 " + query
        logger.info("Enriched generic query '%s' → '%s'", query[:40], enriched[:80])
        return enriched

    return query

# ── 第 1 层：聚合站域名黑名单 ─────────────────────────────────────────────
# 参考 JobMatch-AI 的 37 条列表，扩展了中文招聘站点

# 屏蔽搜索/列表页和非招聘内容，但允许单个 JD 详情页
_BLOCKED_DOMAINS = [
    # JD 模板/样例站（非真实发布）
    "youzhuo.io", "pvuik.com", "meijob.com", "zhiyeapp.com",
    # 社交/论坛/问答（非招聘发布）
    "reddit.com", "zhihu.com", "v2ex.com",
    "jianshu.com", "juejin.cn", "csdn.net/blog",
    # 海外聚合站（与中国市场无关）
    "linkedin.com", "indeed.com", "glassdoor.com", "monster.com",
    "ziprecruiter.com", "simplyhired.com",
    # 低质量/无关来源
    "gaoxiaojob.com",   # 高校人才网 — 内容质量差，含非技术岗位
    "yingjiesheng.com", # 应届生求职网 — 常过期
    "jobui.com",        # 内容单薄
]

# 搜索/列表页 URL 模式屏蔽（允许单个 JD 页面）
_LISTING_PAGE_PATTERNS = [
    r"zhipin\.com/web/geek/job\?",  # BOSS搜索页
    r"zhipin\.com/\?",
    r"search\.51job\.com",          # 51job搜索
    r"sou\.zhaopin\.com",           # 智联搜索
    r"liepin\.com/zhaopin/",        # 猎聘列表
    r"lagou\.com/zhaopin/",         # 拉钩列表
    r"/jobs\?", r"/jobs/search", r"/joblist",
]

# ── 第 2 层：文章/博客/指南检测 ────────────────────────────────────────────

_ARTICLE_PATTERNS = [
    r"/blog/", r"/article/", r"/news/", r"/guide",
    r"complete.guide", r"how.to", r"tutorial",
    r"薪资报告", r"行业分析", r"面经",
]

# ── 第 3 层：JD 内容验证 ─────────────────────────────────────────────────────

# 强正信号：这些关键词几乎一定表示真实招聘发布
_JD_STRONG_POSITIVE = [
    "岗位职责", "任职要求", "职位描述", "岗位要求", "任职资格",
    "工作内容", "职位要求",
    "responsibilities", "qualifications", "requirements:", "what you'll do",
]

# 弱正信号：辅助信号（需至少 2 个才算有效）
_JD_WEAK_POSITIVE = [
    "岗位名称", "工作地点", "薪资范围", "汇报对象", "发布时间",
    "apply now", "hiring", "we're looking for",
]

# 强负信号：问答格式、FAQ 页面、关于招聘的讨论（非 JD 本身）
_JD_NEGATIVE = [
    "Q：", "Q:", "A：", "A:",
    "投递时间：", "校园招聘Q&A", "全职补录", "招聘答疑",
    "面经", "薪资报告", "行业分析",
    "人才计划", "笔试邀请", "面试邀请",
    "招聘流程", "招聘对象", "投递机会",
    "frequently asked", "faq",
]

# 职位 ID 模式：如 "职位 ID：A192104" 或 "Job ID: 12345"
_JOB_ID_RE = re.compile(r"职位\s*(ID|编号)[:：]?\s*[A-Z0-9]{4,}|Job\s*ID[:：]?\s*\w{4,}", re.IGNORECASE)

# 编号要求模式：匹配 "1、文字" "2.文字" 风格，排除 "1.5倍" 等小数误匹配
# 要求：数字 + 、/．/. + 非数字非空白字符（排除小数）
_NUMBERED_REQ_RE = re.compile(r"[1-9][、．\.]\s*[^\d\s.]")


def _is_blocked(url: str) -> bool:
    """检查 URL 是否属于被屏蔽的站点、列表页或文章。"""
    url_lower = url.lower()
    if any(d in url_lower for d in _BLOCKED_DOMAINS):
        return True
    if any(re.search(p, url_lower) for p in _LISTING_PAGE_PATTERNS):
        return True
    if any(re.search(p, url_lower) for p in _ARTICLE_PATTERNS):
        return True
    return False


def _looks_like_jd(text: str) -> bool:
    """验证内容是真实招聘 JD，而非 FAQ 或着陆页。

    使用信号评分机制：
      - 硬拒绝：多个问答标记或明确的 FAQ 关键词
      - 硬通过：职位 ID + 编号要求（非常强的信号）
      - 软评分：强正信号 (2分) + 弱正信号 (1分) ≥ 3
    """
    if not text or len(text) < 100:
        return False

    # 硬拒绝：FAQ/问答模式
    negative_hits = sum(1 for kw in _JD_NEGATIVE if kw in text)
    if negative_hits >= 2:
        return False

    # 硬通过：有职位 ID 且有编号要求（非常强的信号）
    has_job_id = bool(_JOB_ID_RE.search(text))
    numbered_matches = _NUMBERED_REQ_RE.findall(text)
    if has_job_id and len(numbered_matches) >= 2:
        return True

    # 软评分
    score = 0
    text_lower = text.lower()
    for kw in _JD_STRONG_POSITIVE:
        if kw.lower() in text_lower:
            score += 2
    for kw in _JD_WEAK_POSITIVE:
        if kw.lower() in text_lower:
            score += 1
    # 编号列表加分
    if len(numbered_matches) >= 3:
        score += 2

    return score >= 3


def _extract_requirements(text: str) -> str:
    """提取技术要求部分，过滤薪资/福利等噪音。"""
    patterns = [
        r"(?:任职要求|岗位要求|职位要求|技能要求|Requirements)[\s:：]*([\s\S]{30,800}?)(?:薪资|福利|待遇|工作地|联系|投递|公司介绍|$)",
        r"(?:岗位职责|工作职责|Job Description)[\s:：]*([\s\S]{30,800}?)(?:薪资|福利|待遇|$)",
    ]
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            return m.group(1).strip()
    return text[:500].strip()


def _extract_skills(text: str) -> list[str]:
    """从 JD 文本中提取技能关键词。"""
    known_skills = [
        "C++", "C", "Java", "Python", "Go", "Rust", "JavaScript", "TypeScript",
        "React", "Vue", "Node.js", "Spring", "Django", "Flask",
        "Linux", "Docker", "K8s", "Kubernetes", "AWS", "MySQL", "Redis", "MongoDB",
        "Git", "CI/CD", "微服务", "分布式", "多线程", "高并发",
        "机器学习", "深度学习", "NLP", "计算机视觉", "TensorFlow", "PyTorch",
        "数据结构", "算法", "设计模式", "网络编程", "操作系统",
        "Unity", "Unreal", "OpenGL", "Vulkan", "Qt", "MFC",
        "嵌入式", "RTOS", "STM32", "ARM", "FPGA",
    ]
    found = []
    text_upper = text.upper()
    for skill in known_skills:
        if skill.upper() in text_upper or skill in text:
            found.append(skill)
    return found[:8]


# ── 官方校招网站加载器 ─────────────────────────────────────────────────────

def _load_career_sites() -> dict:
    """从 YAML 加载官方校招网站配置。

    返回:
        alias_map:        {别名 -> 校招域名}
        all_campus:       所有校招域名（默认搜索范围）
        all_social:       所有社招域名（兜底）
    """
    import os
    import yaml
    config_path = os.path.join(os.path.dirname(__file__), "career_sites.yaml")
    try:
        with open(config_path, encoding="utf-8") as f:
            data = yaml.safe_load(f)
        alias_map: dict[str, str] = {}
        all_campus: list[str] = []
        all_social: list[str] = []
        for site in data.get("sites", {}).values():
            campus = site.get("campus_domain", site.get("domain", ""))
            social = site.get("domain", "")
            if campus:
                all_campus.append(campus)
            if social and social not in all_social:
                all_social.append(social)
            for alias in site.get("aliases", []):
                if campus:
                    alias_map[str(alias).lower()] = campus
        return {"alias_map": alias_map, "all_campus": all_campus, "all_social": all_social}
    except Exception as e:
        logger.warning("Failed to load career_sites.yaml: %s", e)
        return {"alias_map": {}, "all_campus": [], "all_social": []}


@tool
def search_real_jd(query: str) -> str:
    """从官方招聘网站搜索真实招聘岗位，返回结构化JSON。

    query: 搜索关键词，如"字节跳动 后端工程师 校招"
    返回格式为 [JD_SEARCH_RESULTS:json] 标记，前端渲染为可点击卡片。
    """
    if not query or not query.strip():
        return "请提供搜索关键词，如'C++ 后端开发'。"

    # 用画像中的搜索关键词丰富通用查询（防止返回 HR/杂项结果）
    query = _enrich_query_with_profile(query.strip())

    try:
        import os
        from tavily import TavilyClient

        api_key = os.getenv("TAVILY_API_KEY", "")
        if not api_key:
            return "未配置 TAVILY_API_KEY，无法搜索。请在 .env 中添加。"

        client = TavilyClient(api_key=api_key)

        # 加载官方网站配置
        sites_config = _load_career_sites()
        alias_map: dict = sites_config["alias_map"]
        all_campus: list = sites_config["all_campus"]

        # 检测公司特定查询 → 限制到该公司的校招域名
        query_lower = query.lower()
        matched_domain = next(
            (domain for alias, domain in alias_map.items() if alias in query_lower),
            None
        )
        # 默认：仅校招域名（不返回社招结果）
        include_domains = [matched_domain] if matched_domain else all_campus

        search_query = f"{query} 招聘 岗位职责 任职要求"
        response = client.search(
            query=search_query,
            search_depth="advanced",
            max_results=10,
            include_answer=False,
            include_domains=include_domains,  # Campus recruitment domains only
        )

        raw_results = response.get("results", [])
        if not raw_results:
            company_hint = f"「{matched_domain}」校招页" if matched_domain else "各大厂校招官网"
            return f"在{company_hint}未搜到与'{query}'相关的校招岗位，可能该职位本季度未开放校招，建议关注秋招/春招窗口期。"

        # 过滤：必须像真正的 JD 内容
        filtered = [r for r in raw_results if _looks_like_jd(r.get("content", ""))]
        if not filtered:
            filtered = raw_results[:3]

        # 构建结构化结果
        jd_cards = []
        for r in filtered[:5]:
            content = r.get("content", "")
            requirements = _extract_requirements(content)
            skills = _extract_skills(content)

            jd_cards.append({
                "title": r.get("title", "未知职位"),
                "url": r.get("url", ""),
                "source": _get_domain(r.get("url", "")),
                "skills": skills,
                "requirements": requirements,
                "full_text": content[:3000],  # expanded from 1000 to preserve 任职要求 section
            })

        # 返回结构化标记供前端渲染
        marker = f"[JD_SEARCH_RESULTS:{json.dumps(jd_cards, ensure_ascii=False)}]"
        summary = f"搜到 {len(jd_cards)} 份相关招聘，你可以选择感兴趣的做匹配度诊断。"
        return f"{summary}\n{marker}"

    except ImportError:
        return "未安装 tavily-python，请运行: pip install tavily-python"
    except Exception as e:
        logger.exception("Tavily search failed")
        return f"搜索时出错：{e}"


def _get_domain(url: str) -> str:
    """从 URL 提取可读域名。"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        host = parsed.hostname or ""
        # 去除 www 前缀
        if host.startswith("www."):
            host = host[4:]
        return host
    except Exception:
        return url[:30]
