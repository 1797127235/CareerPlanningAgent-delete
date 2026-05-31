export const BRAND = {
  name: 'CareerOS',
  tagline: '职途智析',
  url: 'github.com/1797127235/CareerPlanningAgent',
}

export const HOOK = {
  headline: 'CS 学生的职业规划，还在靠感觉？',
  sub: '简历、岗位、JD、面试、成长……分散在 5 个工具里，拼不出一条完整的路。',
}

export const STATS = [
  { value: 45, label: '岗位节点' },
  { value: 91.3, label: '% 技能匹配准确率' },
  { value: 6, label: '核心模块' },
  { value: 4, label: '维能力画像' },
]

export const UPLOAD_PROFILE_DATA = {
  fileName: 'resume_linxiaobei.pdf',
  steps: ['上传简历', 'AI 解析', '生成画像'],
  name: '林小北',
  target: '前端开发工程师',
  dimensionScores: [
    { name: '编程基础', score: 82 },
    { name: '前端开发', score: 75 },
    { name: '系统设计', score: 45 },
    { name: '软技能', score: 68 },
    { name: '项目经验', score: 70 },
  ],
  skills: [
    { name: 'React', level: '熟练' },
    { name: 'TypeScript', level: '熟练' },
    { name: 'Node.js', level: '掌握' },
    { name: 'CSS', level: '熟练' },
    { name: 'Webpack', level: '了解' },
    { name: 'Python', level: '了解' },
  ],
  duration: 12,
}

export const GRAPH_JD_DATA = {
  roles: [
    { id: 'fe-mid', label: '前端开发工程师', family: '前端开发', zone: 'safe', salary: '18K', skills: ['React', 'TypeScript', 'Webpack'], aiLeverage: 0.67 },
    { id: 'fe-senior', label: '高级前端工程师', family: '前端开发', zone: 'leverage', salary: '32K', skills: ['Performance', 'Architecture', 'Leadership'], aiLeverage: 0.7 },
    { id: 'be-mid', label: '后端开发工程师', family: '后端开发', zone: 'transition', salary: '19K', skills: ['Java', 'Spring', 'MySQL'], aiLeverage: 0.4 },
    { id: 'fullstack', label: '全栈开发工程师', family: '全栈', zone: 'leverage', salary: '25K', skills: ['React', 'Node.js', 'PostgreSQL'], aiLeverage: 0.72 },
    { id: 'algo-mid', label: '算法工程师', family: 'AI/ML', zone: 'leverage', salary: '35K', skills: ['PyTorch', 'Python', 'Math'], aiLeverage: 0.85 },
  ],
  radarAxes: [
    { label: '技能深度', value: 0.7 },
    { label: '薪资潜力', value: 0.6 },
    { label: 'AI 协同', value: 0.67 },
    { label: '转型空间', value: 0.5 },
    { label: '市场需求', value: 0.75 },
  ],
  selectedRole: '前端开发工程师',
  aiInfluence: '67%',
  jdText: '岗位职责：负责公司核心产品的前端架构设计与开发。要求精通 React/TypeScript，熟悉前端工程化（Webpack/Vite），具备组件库搭建和性能优化经验，了解 Node.js SSR 方案…',
  matchScore: 78,
  matchLabel: '高度匹配',
  dimensions: [
    { key: 'foundation', label: '基础素养', score: 82 },
    { key: 'skill', label: '技能匹配', score: 75 },
    { key: 'potential', label: '成长潜力', score: 80 },
    { key: 'soft_skill', label: '软技能', score: 68 },
  ],
  matchedSkills: ['React', 'TypeScript', 'Webpack', 'Git', 'REST API'],
  gapSkills: ['React 高级模式', '系统设计', 'SSR'],
  duration: 25,
}

export const INTERVIEW_AI_DATA = {
  question: '请解释 React 中 useEffect 的清理机制，以及在什么场景下需要使用它？',
  answer: 'useEffect 的清理机制通过返回一个函数来实现。当组件卸载或依赖项变化导致 effect 重新执行前，React 会调用上一次的清理函数。常见场景包括：清除定时器、取消订阅、中断 API 请求等。',
  overallScore: 82,
  perQuestion: [
    { question: 'useEffect 清理机制', score: 85 },
    { question: 'React 性能优化', score: 78 },
  ],
  strengths: ['概念理解清晰', '能结合实际场景举例'],
  improvements: ['可以更深入讨论闭包陷阱', '建议补充自定义 Hook 的实践'],
  aiImpact: {
    label: 'AI 对前端开发的影响',
    enhance: 67,
    transition: 23,
    danger: 10,
  },
  duration: 20,
}

export const GROWTH_DATA_V2 = {
  filters: ['全部', '项目', '面试', '学习', '计划'],
  entries: [
    { type: 'project', title: '在线协作白板 v2.0', subtitle: '完成了实时同步模块重构', tags: ['React', 'WebSocket'], status: '进行中' },
    { type: 'interview', title: '字节跳动 · 一面', subtitle: '前端开发实习生', tags: ['算法', '系统设计'], status: '通过' },
    { type: 'learning', title: '完成 WebGL 基础课程', subtitle: 'Three.js 官方教程 + 实践项目', tags: ['WebGL', 'Three.js'], status: '已完成' },
  ],
  aiSuggestion: '基于你近期的项目进度和面试表现，建议优先补强「系统设计」方向，同时保持前端深度练习。',
  planItems: ['学习 React Profiler 性能分析', '完成系统设计基础课程', '模拟面试练习 3 次'],
  duration: 20,
}

export const REPORT_DATA = {
  title: '林小北的职业发展报告',
  date: '2026.05.31',
  target: '前端开发工程师',
  chapters: [
    { numeral: 'I', title: '你是谁', summary: '编程基础扎实，前端技能突出，系统设计是短板' },
    { numeral: 'II', title: '你能去哪', summary: '前端开发工程师（高度匹配），全栈方向（可转型）' },
    { numeral: 'III', title: '差距', summary: 'React 高级模式、系统设计、SSR 是主要提升方向' },
    { numeral: 'IV', title: '下一步', summary: '补强系统设计 → 模拟面试 → 目标字节跳动秋招' },
  ],
  actionPlan: [
    { task: '完成系统设计基础课程', deadline: '2 周', evidence: '面试评估' },
    { task: 'React 高级模式实战项目', deadline: '3 周', evidence: '项目记录' },
    { task: '模拟面试练习 5 次', deadline: '1 周', evidence: '面试记录' },
    { task: '字节跳动秋招投递', deadline: '4 周', evidence: '成长账本' },
  ],
  duration: 20,
}

export const CTA_V2 = {
  headline: '不只是职业建议，是证据驱动的职业操作系统',
  sub: 'CareerOS · 开源 · 本地优先 · AI 驱动',
  url: 'github.com/1797127235/CareerPlanningAgent',
}

export const UPLOAD_FLOW = { steps: [{ label: '上传简历', desc: 'PDF / DOC' }, { label: 'AI 解析', desc: '技能提取' }, { label: '能力画像', desc: '技能雷达' }], duration: 8 }
export const PROFILE_DATA = { ...UPLOAD_PROFILE_DATA, strengths: ['快速学习'], weaknesses: ['系统设计不足'], recommendations: [{ title: '前端开发工程师', match: 87, zone: 'leverage' }, { title: '全栈开发', match: 72, zone: 'transition' }], internships: [{ company: '字节跳动', role: '前端实习生', period: '2024.06-2024.09' }], projects: [{ name: '协作白板', tech: 'React + WebSocket' }], duration: 8 }
export const GRAPH_DATA = { ...GRAPH_JD_DATA, transitionPath: { from: '前端开发', to: '高级前端', gapSkills: ['Performance', 'Architecture'], hours: 1200 }, duration: 10 }
export const JD_DATA = { sampleText: GRAPH_JD_DATA.jdText, matchScore: GRAPH_JD_DATA.matchScore, matchLabel: GRAPH_JD_DATA.matchLabel, dimensions: GRAPH_JD_DATA.dimensions, matchedSkills: GRAPH_JD_DATA.matchedSkills, gapSkills: GRAPH_JD_DATA.gapSkills, zone: { key: 'transition', label: '转型过渡区', desc: '' }, duration: 10 }
export const INTERVIEW_DATA = { ...INTERVIEW_AI_DATA, tracks: [{ id: 'frontend', label: '前端开发', icon: 'Monitor' }, { id: 'backend', label: '后端开发', icon: 'Server' }], selectedTrack: '前端开发', perQuestion: [{ question: 'useEffect 清理机制', score: 85, feedback: '回答准确' }, { question: 'React 性能优化', score: 78, feedback: '缺少场景分析' }], duration: 12 }
export const GROWTH_DATA = { ...GROWTH_DATA_V2, activeFilter: '全部', entries: [...GROWTH_DATA_V2.entries, { type: 'plan', title: '本周目标', subtitle: '性能优化专题', tags: ['性能优化'], status: '待完成' }], duration: 10 }
export const CTA = CTA_V2
