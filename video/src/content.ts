export const VIDEO_META = {
  totalSeconds: 98,
  fps: 30,
}

export const HOOK = {
  line1: '职业规划，学生缺的不是信息，',
  line2: '而是一条完整的路径。',
  sub: '简历、岗位、JD、面试、成长记录都存在，但它们彼此割裂。',
  duration: 8,
}

export const UPLOAD_PROFILE_DATA = {
  duration: 12,
  fileName: '学生简历.pdf',
  steps: ['上传简历', 'AI 解析', '生成画像'],
  name: '一位计算机学生',
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
  ],
}

export const GRAPH_JD_DATA = {
  duration: 26,
  sceneLabel: '先推荐匹配岗位，再诊断 JD 差距',
  matchScore: 78,
  matchLabel: '目标岗位可达，但存在关键缺口',
  evidence: ['来自简历画像', '来自真实 JD', '来自图谱技能要求'],
  gapSkills: ['React 高级模式', '系统设计', 'SSR'],
}

export const INTERVIEW_AI_DATA = {
  duration: 16,
  sceneLabel: '建议给出之后，还要做一轮真实验证',
  title: '让建议先接受一次面试验证',
  sub: 'CareerOS 会带着画像、目标 JD、关键缺口和历史记录，发起一轮更有针对性的模拟面试。',
  question: '结合你在协作白板项目中的性能优化经历，解释一次真实的瓶颈定位过程。',
  answer:
    '我先用 Chrome DevTools Performance 面板定位掉帧区间，再把问题收敛到 Canvas 重绘和状态更新频率。随后用 requestAnimationFrame 节流、脏矩形重绘和事件批处理，把白板拖拽时的帧率从 15fps 提到 55fps。',
  followUp: '如果这是真实面试，CareerOS 还会继续追问：你怎么证明这次优化真的有效，而不是只感觉更流畅？',
  contextSignals: [
    { label: '画像项目', detail: '协作白板 · React / Canvas 性能优化' },
    { label: '目标 JD', detail: '关注 React 深度、性能优化、工程表达' },
    { label: '关键缺口', detail: '量化证据、系统表达、性能原理' },
    { label: '历史记录', detail: '上轮复盘卡在“怎么证明优化有效”' },
  ],
  checks: [
    { label: '结构', detail: '已经能按“定位 → 分析 → 优化 → 结果”讲完整', status: '已建立' },
    { label: '证据', detail: '开始引用工具和过程，但量化指标还不够充分', status: '继续追问' },
    { label: '表达', detail: '回答更贴近真实面试，不再停留在概念背诵', status: '开始转化' },
  ],
  verdictTitle: '建议开始转化成可验证的面试表达',
  verdictBody: '这轮回答已经能支撑继续投递，但智能体仍会围绕量化证据和关键缺口继续追问。',
  nextActions: ['补一条量化复盘', '再练一轮关键追问', '结果写回成长手札'],
}

export const GROWTH_DATA_V2 = {
  duration: 10,
  aiSuggestion: '优先补强系统设计，同时保留前端深度练习。',
  planItems: ['完成系统设计基础课程', '补一个 SSR 项目', '做 3 次模拟面试'],
}

export const REPORT_DATA = {
  duration: 12,
  title: '一位计算机学生的职业发展报告',
  finalLine: '前面的每一次分析，都会沉淀成可执行的职业规划。',
}

export const CTA_V2 = {
  duration: 14,
  headline: '从画像，到差距判断，到建议，到成长。',
  sub: 'CareerOS 是一套职业决策闭环系统。',
  valuePills: ['面向学生', '面向高校', '面向机构'],
  finalLine: 'CareerOS 不是一次匹配，而是一条持续协作的职业决策路径。',
}
