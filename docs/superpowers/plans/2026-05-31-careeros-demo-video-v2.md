# CareerOS Demo Video v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Remotion demo video from a 69s feature list to a 115s story-driven product demo for thesis defense, following the "one student's journey" narrative.

**Architecture:** 7 scenes (Hook → UploadProfile → GraphJD → InterviewAI → Growth → Report → CTA). Pure Remotion code-rebuilt UI components with MiniNavbar. All animation via `useCurrentFrame()` + `interpolate()`. No CSS transitions/animations.

**Tech Stack:** Remotion, React, TypeScript

---

## File Map

### New files
| File | Purpose |
|:--|:--|
| `video/src/scenes/UploadProfileScene.tsx` | Merged Upload + Profile (12s) |
| `video/src/scenes/GraphJDScene.tsx` | Merged Graph + JD (25s) |
| `video/src/scenes/InterviewAIScene.tsx` | Interview + AI impact bar (20s) |
| `video/src/scenes/GrowthScene.tsx` | Compressed Growth loop (20s) |
| `video/src/scenes/ReportScene.tsx` | New editorial report (20s) |

### Modified files
| File | Change |
|:--|:--|
| `video/src/content.ts` | New data for merged scenes + Report + updated durations |
| `video/src/Composition.tsx` | New 7-scene timeline |
| `video/src/scenes/CTAScene.tsx` | Extend from 5s → 10s, update copy |
| `video/src/components/UIPrimitives.tsx` | Add ChapterTitle, DropCap, PaperCard components |

### Unchanged files
| File | Notes |
|:--|:--|
| `video/src/scenes/HookScene.tsx` | Keep as-is (8s → 8s) |
| `video/src/tokens.ts` | No changes needed |
| `video/src/components/Animations.tsx` | FadeIn, NumberTicker all reusable |
| `video/src/Root.tsx` | No changes needed |

### Old files to keep (not deleted, just unused)
- `video/src/scenes/UploadFlowScene.tsx`
- `video/src/scenes/ProfileDemoScene.tsx`
- `video/src/scenes/GraphDemoScene.tsx`
- `video/src/scenes/JDDemoScene.tsx`
- `video/src/scenes/InterviewDemoScene.tsx`
- `video/src/scenes/GrowthDemoScene.tsx`
- `video/src/scenes/FeaturesScene.tsx`

---

## Task 1: Update content.ts with new scene data

**Files:**
- Modify: `video/src/content.ts`

- [ ] **Step 1: Rewrite content.ts with new data structure**

Replace the entire content.ts. Key changes:
- Remove separate `UPLOAD_FLOW` and `PROFILE_DATA`, add `UPLOAD_PROFILE_DATA` (duration: 12)
- Remove separate `GRAPH_DATA` and `JD_DATA`, add `GRAPH_JD_DATA` (duration: 25) — includes roles array, radarAxes, JD text, match score, dimensions, matched/gap skills
- Replace `INTERVIEW_DATA` with `INTERVIEW_AI_DATA` (duration: 20) — remove tracks array, add `aiImpact` object with percentages
- Update `GROWTH_DATA` duration to 20
- Add new `REPORT_DATA` (duration: 20) — with chapters array, actionPlan, evidenceChain
- Update `CTA` headline to "不只是职业建议，是证据驱动的职业操作系统"
- Update `STATS` to match new story

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (in `video/` directory)
Expected: PASS (old scene files still import old exports, will break — this is expected, we fix in later tasks)

Note: This step will intentionally break compilation. That's OK — the next tasks will fix it by creating the new scene files. If you prefer zero-breakage, comment out the old scene files' imports first.

---

## Task 2: Add Report UI primitives to UIPrimitives.tsx

**Files:**
- Modify: `video/src/components/UIPrimitives.tsx`

- [ ] **Step 1: Add ChapterTitle, DropCap, PaperCard, and ReportActionItem components**

Append these components after the existing `MiniCard` component:

```typescript
export const ChapterTitle: React.FC<{
  numeral: string
  title: string
  delay?: number
}> = ({ numeral, title, delay = 0 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fadeIn(frame, fps, delay, 0.5)
  const translateY = interpolate(opacity, [0, 1], [12, 0])

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, opacity, transform: `translateY(${translateY}px)` }}>
      <span style={{ fontSize: 40, fontWeight: 900, color: C.chestnut, fontFamily: FONT.sans, lineHeight: 1 }}>
        {numeral}
      </span>
      <span style={{ fontSize: 22, fontWeight: 700, color: C.ink, fontFamily: FONT.sans }}>
        {title}
      </span>
    </div>
  )
}

export const DropCap: React.FC<{
  text: string
  delay?: number
}> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fadeIn(frame, fps, delay, 0.4)

  return (
    <div style={{ fontSize: 14, color: C.ink2, lineHeight: 1.7, fontFamily: FONT.sans, opacity, maxHeight: 48, overflow: 'hidden' }}>
      <span style={{ fontSize: 36, fontWeight: 800, color: C.chestnut, float: 'left', lineHeight: '32px', marginRight: 6, marginTop: 2 }}>
        {text.charAt(0)}
      </span>
      {text.slice(1)}
    </div>
  )
}

export const PaperCard: React.FC<{
  children: React.ReactNode
  delay?: number
  style?: React.CSSProperties
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const anim = slideUp(frame, fps, delay, 0.5, 10)

  return (
    <div
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.lineSoft}`,
        borderRadius: 16,
        padding: 24,
        opacity: anim.opacity,
        transform: `translateY(${anim.translateY}px)`,
        boxShadow: `0 2px 12px rgba(107,62,46,0.06)`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export const ReportActionItem: React.FC<{
  task: string
  deadline: string
  evidence: string
  index: number
  delay?: number
}> = ({ task, deadline, evidence, index, delay = 0 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fadeIn(frame, fps, delay + index * 0.25, 0.4)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        backgroundColor: C.paper2,
        borderRadius: 10,
        opacity,
        marginBottom: 6,
      }}
    >
      <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: C.chestnut, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.white, fontWeight: 700, flexShrink: 0 }}>
        {index + 1}
      </div>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: FONT.sans }}>{task}</div>
      <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: FONT.sans, whiteSpace: 'nowrap' }}>{deadline}</div>
      <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, backgroundColor: `${C.chestnut}12`, color: C.chestnut, fontWeight: 600, fontFamily: FONT.sans }}>
        {evidence}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (in `video/`)
Expected: PASS (only added new exports, no breaking changes)

---

## Task 3: Create UploadProfileScene (12s)

**Files:**
- Create: `video/src/scenes/UploadProfileScene.tsx`

- [ ] **Step 1: Write UploadProfileScene**

This scene merges upload and profile into one continuous flow. Three phases:
- Phase 1 (0-4s): Upload card + file drop animation
- Phase 2 (4-8s): Progress ring + step indicators
- Phase 3 (8-12s): Profile card + dimension bars + skill chips appear simultaneously

```typescript
import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, Easing } from 'remotion'
import { C, FONT } from '../tokens'
import { UPLOAD_PROFILE_DATA } from '../content'
import { ScoreBar, SkillChip, MiniNavbar, fadeIn, slideUp, delayFrame } from '../components/UIPrimitives'

const UploadProfileScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = UPLOAD_PROFILE_DATA
  const total = d.duration

  const phase2Start = 4
  const phase3Start = 8

  const isPhase1 = frame < phase2Start * fps
  const isPhase2 = frame >= phase2Start * fps && frame < phase3Start * fps
  const isPhase3 = frame >= phase3Start * fps

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar activeLabel="能力画像" />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', gap: 32, alignItems: 'center', justifyContent: 'center' }}>
          {isPhase1 && <Phase1 />}
          {isPhase2 && <Phase2 />}
          {isPhase3 && <Phase3 d={d} />}
        </div>
        <BottomSteps frame={frame} fps={fps} phase2Start={phase2Start} phase3Start={phase3Start} steps={d.steps} />
      </div>
    </AbsoluteFill>
  )
}

const Phase1: React.FC = () => {
  const opacity = fadeIn(useCurrentFrame(), useVideoConfig().fps, 0.2, 0.5)
  return (
    <div style={{ opacity, display: 'flex', gap: 24 }}>
      <div style={{ width: 260, height: 160, borderRadius: 16, border: `2px dashed ${C.chestnut}60`, backgroundColor: C.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: `${C.chestnut}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📄</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>拖入简历上传</div>
        <div style={{ fontSize: 12, color: C.inkMuted }}>PDF / DOC / TXT</div>
      </div>
      <div style={{ width: 260, height: 160, borderRadius: 16, border: `1px solid ${C.line}`, backgroundColor: C.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✏️</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>手动讲给我听</div>
        <div style={{ fontSize: 12, color: C.inkMuted }}>几个字就够了</div>
      </div>
    </div>
  )
}

const Phase2: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const progress = interpolate(frame, [4 * fps, 8 * fps], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const size = 90
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  const steps = ['上传简历', 'AI 解析', '生成画像']
  const stepDoneAt = [5, 6.5, 7.5]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48, opacity: fadeIn(frame, fps, 4, 0.3) }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={C.line} strokeWidth={stroke} fill="transparent" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={C.chestnut} strokeWidth={stroke} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((label, i) => {
          const done = frame >= stepDoneAt[i] * fps
          const active = !done && frame >= (stepDoneAt[i] - 0.8) * fps
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, display: 'flex', justifyContent: 'center' }}>
                {done ? <span style={{ fontSize: 14, color: C.success }}>✓</span> : <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: active ? C.chestnut : C.line }} />}
              </div>
              <span style={{ fontSize: 14, fontWeight: done ? 600 : 400, color: done ? C.ink : active ? C.chestnut : C.inkMuted, fontFamily: FONT.sans }}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Phase3: React.FC<{ d: typeof UPLOAD_PROFILE_DATA }> = ({ d }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const anim = slideUp(frame, fps, 8, 0.5, 14)

  return (
    <div style={{ display: 'flex', gap: 40, width: '100%', opacity: anim.opacity, transform: `translateY(${anim.translateY}px)` }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, fontFamily: FONT.sans }}>{d.name}</div>
              <div style={{ fontSize: 14, color: C.chestnut, fontFamily: FONT.sans, marginTop: 4 }}>目标：{d.target}</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: `linear-gradient(135deg, ${C.chestnut}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: C.white, fontWeight: 700 }}>林</div>
          </div>
        </div>
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>能力维度</div>
          {d.dimensionScores.map((dim, i) => (
            <ScoreBar key={i} label={dim.name} score={dim.score} delay={8.3 + i * 0.25} />
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>技能标签</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {d.skills.map((skill, i) => (
              <SkillChip key={i} label={`${skill.name} · ${skill.level}`} type="neutral" delay={8.6 + i * 0.12} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const BottomSteps: React.FC<{ frame: number; fps: number; phase2Start: number; phase3Start: number; steps: string[] }> = ({ frame, fps, phase2Start, phase3Start, steps }) => {
  const stepTimes = [0, phase2Start, phase3Start]
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexShrink: 0 }}>
      {steps.map((label, i) => {
        const done = frame >= stepTimes[i] * fps
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: done ? C.chestnut : C.line, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: done ? C.white : C.inkMuted, fontWeight: 700 }}>
              {done ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 13, color: done ? C.ink : C.inkMuted, fontWeight: done ? 600 : 400, fontFamily: FONT.sans }}>{label}</span>
            {i < 2 && <div style={{ width: 28, height: 2, backgroundColor: done ? C.chestnut : C.line }} />}
          </div>
        )
      })}
    </div>
  )
}

export default UploadProfileScene
```

- [ ] **Step 2: Verify file compiles in isolation**

Run: `npx tsc --noEmit` (in `video/`)
Expected: May fail due to old scene imports in Composition.tsx — that's OK, we fix Composition.tsx later.

---

## Task 4: Create GraphJDScene (25s)

**Files:**
- Create: `video/src/scenes/GraphJDScene.tsx`

- [ ] **Step 1: Write GraphJDScene**

Two phases: Graph coverflow (0-12s) → JD match analysis (12-25s). Reuses RoleCard, RadarChart, ScoreRing, SkillChip from UIPrimitives.

```typescript
import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, Easing } from 'remotion'
import { C, FONT } from '../tokens'
import { GRAPH_JD_DATA } from '../content'
import { RadarChart, ScoreRing, SkillChip, MiniNavbar, fadeIn, delayFrame } from '../components/UIPrimitives'

const zoneColor = (zone: string) =>
  zone === 'safe' ? C.zoneSafe : zone === 'leverage' ? C.zoneLeverage : zone === 'transition' ? C.zoneTransition : C.zoneDanger
const zoneLabel = (zone: string) =>
  zone === 'safe' ? '安全区' : zone === 'leverage' ? '协同优势' : zone === 'transition' ? '转型过渡' : '替代警惕'

const GraphJDScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = GRAPH_JD_DATA
  const graphEnd = 12

  const isGraph = frame < graphEnd * fps
  const isJD = frame >= graphEnd * fps

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar activeLabel="职位地图" />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        {isGraph && <GraphPhase d={d} fps={fps} />}
        {isJD && <JDPhase d={d} frame={frame} fps={fps} />}
      </div>
    </AbsoluteFill>
  )
}

const GraphPhase: React.FC<{ d: typeof GRAPH_JD_DATA; fps: number }> = ({ d, fps }) => {
  const frame = useCurrentFrame()
  const coverflowProgress = interpolate(frame, [0.5 * fps, 4 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) })
  const centerIdx = Math.round(coverflowProgress * (d.roles.length - 1))
  const radarVisible = fadeIn(frame, fps, 6, 0.5)
  const influenceVisible = fadeIn(frame, fps, 8, 0.5)

  return (
    <>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, letterSpacing: 1, marginBottom: 16, opacity: fadeIn(frame, fps, 0, 0.4) }}>
        02 · 岗位图谱 → JD 匹配
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 32 }}>
        <div style={{ flex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {d.roles.map((role, i) => {
            const dist = i - centerIdx
            const absDist = Math.abs(dist)
            const cardOpacity = absDist > 2 ? 0 : absDist === 0 ? 1 : 0.45
            const cardScale = absDist === 0 ? 1.05 : 0.82
            const cardOffsetX = dist * 110

            return (
              <div key={i} style={{ position: 'absolute', left: '50%', marginLeft: -110 + cardOffsetX }}>
                <div style={{
                  width: 220, height: 280, backgroundColor: C.card,
                  border: `1.5px solid ${absDist === 0 ? C.chestnut : C.lineSoft}`,
                  borderRadius: 20, padding: 20, opacity: Math.min(cardOpacity, fadeIn(frame, fps, 0.3, 0.4)),
                  transform: `scale(${cardScale})`,
                  boxShadow: absDist === 0 ? `0 8px 32px ${C.chestnut}20` : '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: zoneColor(role.zone), backgroundColor: `${zoneColor(role.zone)}15`, padding: '3px 10px', borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 }}>{zoneLabel(role.zone)}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, fontFamily: FONT.sans, marginBottom: 4 }}>{role.label}</div>
                  <div style={{ fontSize: 12, color: C.inkMuted, marginBottom: 12 }}>{role.family}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.chestnut, marginBottom: 8 }}>{role.salary}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {role.skills.map((s, si) => <span key={si} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, backgroundColor: C.paper2, color: C.ink2 }}>{s}</span>)}
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.inkMuted, marginBottom: 3 }}>
                      <span>AI 协同度</span><span>{Math.round(role.aiLeverage * 100)}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, backgroundColor: C.line, overflow: 'hidden' }}>
                      <div style={{ width: `${role.aiLeverage * 100}%`, height: '100%', borderRadius: 2, backgroundColor: zoneColor(role.zone) }} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20, opacity: radarVisible }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 12, letterSpacing: 1 }}>岗位能力雷达</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart axes={d.radarAxes} size={200} delay={6.2} />
            </div>
          </div>
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20, opacity: influenceVisible }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>AI 影响分析</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: C.chestnut, fontFamily: FONT.sans }}>{d.aiInfluence}</div>
            <div style={{ fontSize: 13, color: C.inkMuted, fontFamily: FONT.sans }}>前端开发岗位的 AI 协同度</div>
          </div>
        </div>
      </div>
    </>
  )
}

const JDPhase: React.FC<{ d: typeof GRAPH_JD_DATA; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const jdStart = 12
  const f = delayFrame(frame, jdStart, fps)
  const charCount = Math.min(d.jdText.length, Math.floor(f / 2.5))
  const visibleText = d.jdText.slice(0, charCount)

  const scoreVisible = fadeIn(frame, fps, 15, 0.5)
  const dimsVisible = fadeIn(frame, fps, 17, 0.5)
  const skillsVisible = fadeIn(frame, fps, 19, 0.5)

  return (
    <>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, letterSpacing: 1, marginBottom: 16, opacity: fadeIn(frame, fps, jdStart, 0.4) }}>
        02 · JD 匹配分析
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 32 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20, opacity: fadeIn(frame, fps, jdStart, 0.3) }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>职位描述</div>
            <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.7, fontFamily: FONT.sans, backgroundColor: C.paper2, padding: 16, borderRadius: 12, border: `1px solid ${C.lineSoft}`, minHeight: 100, maxHeight: 140, overflow: 'hidden' }}>
              {visibleText}
              {charCount < d.jdText.length && <span style={{ borderRight: `2px solid ${C.chestnut}`, marginLeft: 1 }}> </span>}
            </div>
          </div>
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20, opacity: dimsVisible }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 12, letterSpacing: 1 }}>四维评分</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {d.dimensions.map((dim, i) => {
                const color = dim.score >= 80 ? C.chestnut : dim.score >= 70 ? C.chestnutLight : C.accent
                return (
                  <div key={i} style={{ backgroundColor: C.paper2, borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>{dim.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: FONT.sans }}>{dim.score}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: scoreVisible }}>
            <ScoreRing score={d.matchScore} size={120} delay={15} label="匹配度" />
            <div style={{ fontSize: 16, fontWeight: 700, color: C.chestnut, fontFamily: FONT.sans }}>{d.matchLabel}</div>
          </div>
          <div style={{ opacity: skillsVisible }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.zoneSafe, marginBottom: 8, letterSpacing: 1 }}>已匹配 ✓</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
              {d.matchedSkills.map((s, i) => <SkillChip key={i} label={s} type="match" delay={19 + i * 0.1} />)}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 8, letterSpacing: 1 }}>缺口技能</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {d.gapSkills.map((s, i) => <SkillChip key={i} label={s} type="gap" delay={20 + i * 0.1} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GraphJDScene
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (in `video/`)

---

## Task 5: Create InterviewAIScene (20s)

**Files:**
- Create: `video/src/scenes/InterviewAIScene.tsx`

- [ ] **Step 1: Write InterviewAIScene**

Two phases: Interview simulation (0-14s) → AI impact overlay (14-20s). No track selector — jumps directly to the interview.

```typescript
import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion'
import { C, FONT } from '../tokens'
import { INTERVIEW_AI_DATA } from '../content'
import { ScoreRing, MiniNavbar, fadeIn, slideUp, delayFrame } from '../components/UIPrimitives'

const InterviewAIScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = INTERVIEW_AI_DATA

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, letterSpacing: 1, marginBottom: 16, opacity: fadeIn(frame, fps, 0, 0.4) }}>
          04 · 面试教练
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 32 }}>
          <InterviewPhase d={d} frame={frame} fps={fps} />
          <AIImpactPhase d={d} frame={frame} fps={fps} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

const InterviewPhase: React.FC<{ d: typeof INTERVIEW_AI_DATA; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const questionVisible = fadeIn(frame, fps, 0.5, 0.5)
  const answerDelay = 2.5
  const f = delayFrame(frame, answerDelay, fps)
  const charCount = Math.min(d.answer.length, Math.floor(f / 2))
  const answerVisible = d.answer.slice(0, charCount)
  const showAnswer = frame >= answerDelay * fps

  const scoreVisible = fadeIn(frame, fps, 8, 0.5)
  const feedbackVisible = fadeIn(frame, fps, 10, 0.5)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20, opacity: questionVisible }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: C.white }}>AI</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.ink2, fontFamily: FONT.sans }}>面试官提问</span>
        </div>
        <div style={{ fontSize: 15, color: C.ink, lineHeight: 1.6, fontFamily: FONT.sans }}>{d.question}</div>
      </div>

      {showAnswer && (
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20, opacity: fadeIn(frame, fps, answerDelay, 0.3) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${C.chestnut}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.white, fontWeight: 700 }}>林</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.ink2, fontFamily: FONT.sans }}>我的回答</span>
          </div>
          <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.7, fontFamily: FONT.sans, backgroundColor: C.paper2, padding: 14, borderRadius: 10, minHeight: 60, maxHeight: 120, overflow: 'hidden' }}>
            {answerVisible}
            {charCount < d.answer.length && <span style={{ borderRight: `2px solid ${C.chestnut}`, marginLeft: 1 }}> </span>}
          </div>
        </div>
      )}

      <div style={{ opacity: scoreVisible, display: 'flex', alignItems: 'center', gap: 20 }}>
        <ScoreRing score={d.overallScore} size={80} delay={8} label="综合评分" />
        <div>
          {d.perQuestion.map((q, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
              <span style={{ fontSize: 12, color: C.ink2, fontFamily: FONT.sans }}>{q.question}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: q.score >= 80 ? C.chestnut : C.accent, fontFamily: FONT.sans, marginLeft: 12 }}>{q.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ opacity: feedbackVisible }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.success, marginBottom: 6 }}>亮点</div>
            {d.strengths.map((s, i) => <div key={i} style={{ fontSize: 12, color: C.ink, marginBottom: 3, opacity: fadeIn(frame, fps, 10.3 + i * 0.2, 0.3) }}>✓ {s}</div>)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 6 }}>改进</div>
            {d.improvements.map((s, i) => <div key={i} style={{ fontSize: 12, color: C.ink, marginBottom: 3, opacity: fadeIn(frame, fps, 10.6 + i * 0.2, 0.3) }}>○ {s}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

const AIImpactPhase: React.FC<{ d: typeof INTERVIEW_AI_DATA; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const visible = fadeIn(frame, fps, 14, 0.6)
  const impact = d.aiImpact
  const bars = [
    { label: 'AI 增强区', pct: impact.enhance, color: C.zoneSafe },
    { label: '转型过渡区', pct: impact.transition, color: C.zoneTransition },
    { label: '替代警惕区', pct: impact.danger, color: C.zoneDanger },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: visible }}>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 16, letterSpacing: 1 }}>{impact.label}</div>
        {bars.map((bar, i) => {
          const f = delayFrame(frame, 14.5, fps)
          const pct = Math.min(bar.pct, (f / (5 * fps)) * bar.pct * 3)
          return (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.ink, marginBottom: 6, fontFamily: FONT.sans }}>
                <span>{bar.label}</span>
                <span style={{ fontWeight: 700 }}>{Math.round(Math.min(pct, bar.pct))}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, backgroundColor: C.line, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(pct, bar.pct)}%`, height: '100%', borderRadius: 5, backgroundColor: bar.color }} />
              </div>
            </div>
          )
        })}
        <div style={{ marginTop: 16, padding: '12px 16px', backgroundColor: `${C.chestnut}08`, borderRadius: 10, borderLeft: `3px solid ${C.chestnut}`, fontSize: 13, color: C.ink2, lineHeight: 1.6, fontFamily: FONT.sans }}>
          了解 AI 对你目标岗位的影响，才能做出更聪明的职业选择。
        </div>
      </div>
    </div>
  )
}

export default InterviewAIScene
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (in `video/`)

---

## Task 6: Create GrowthScene (20s)

**Files:**
- Create: `video/src/scenes/GrowthScene.tsx`

- [ ] **Step 1: Write GrowthScene**

Three quick phases: Input (0-6s) → Entries + AI suggestion (6-13s) → Kanban + plan (13-20s). Adapted from existing GrowthDemoScene but compressed.

```typescript
import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from 'remotion'
import { C, FONT } from '../tokens'
import { GROWTH_DATA_V2 } from '../content'
import { MiniNavbar, fadeIn, delayFrame } from '../components/UIPrimitives'

const statusColor = (status: string) => {
  switch (status) {
    case '进行中': return C.blue
    case '通过': case '已完成': return C.zoneSafe
    case '待完成': return C.accent
    default: return C.inkMuted
  }
}

const GrowthScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = GROWTH_DATA_V2

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar activeLabel="成长手札" />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, letterSpacing: 1, marginBottom: 16, opacity: fadeIn(frame, fps, 0, 0.4) }}>
          05 · 成长账本
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 32 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InputArea frame={frame} fps={fps} />
            <EntriesList d={d} frame={frame} fps={fps} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AISuggestion d={d} frame={frame} fps={fps} />
            <ActionPlan d={d} frame={frame} fps={fps} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const InputArea: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const typewriterText = '完成字节跳动一面，问了 React 性能优化…'
  const f = delayFrame(frame, 0.5, fps)
  const charCount = Math.min(typewriterText.length, Math.floor(f / 2))
  const visible = typewriterText.slice(0, charCount)
  const showFilters = fadeIn(frame, fps, 2, 0.4)

  return (
    <>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 16, opacity: fadeIn(frame, fps, 0.3, 0.3) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, backgroundColor: C.paper2, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: C.ink, fontFamily: FONT.sans }}>
            {visible}
            {charCount < typewriterText.length && <span style={{ borderRight: `2px solid ${C.chestnut}`, marginLeft: 1 }}> </span>}
          </div>
          <div style={{ padding: '8px 18px', borderRadius: 10, backgroundColor: C.chestnut, color: C.white, fontSize: 13, fontWeight: 600 }}>记录</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, opacity: showFilters }}>
        {['全部', '项目', '面试', '学习'].map((f, i) => (
          <span key={i} style={{ padding: '4px 14px', borderRadius: 16, fontSize: 12, fontWeight: 600, backgroundColor: i === 0 ? `${C.chestnut}12` : C.paper2, color: i === 0 ? C.chestnut : C.ink2, border: i === 0 ? `1px solid ${C.chestnut}30` : `1px solid ${C.lineSoft}`, fontFamily: FONT.sans }}>
            {f}
          </span>
        ))}
      </div>
    </>
  )
}

const EntriesList: React.FC<{ d: typeof GROWTH_DATA_V2; frame: number; fps: number }> = ({ d, frame, fps }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {d.entries.map((entry, i) => {
        const opacity = fadeIn(frame, fps, 4 + i * 0.5, 0.4)
        return (
          <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 12, padding: '12px 16px', opacity }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: FONT.sans }}>{entry.title}</div>
              <div style={{ padding: '2px 10px', borderRadius: 8, backgroundColor: `${statusColor(entry.status)}15`, fontSize: 11, fontWeight: 600, color: statusColor(entry.status) }}>
                {entry.status}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 4, fontFamily: FONT.sans }}>{entry.subtitle}</div>
          </div>
        )
      })}
    </div>
  )
}

const AISuggestion: React.FC<{ d: typeof GROWTH_DATA_V2; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const visible = fadeIn(frame, fps, 8, 0.5)
  return (
    <div style={{ backgroundColor: `${C.chestnut}08`, border: `1px solid ${C.chestnut}20`, borderRadius: 16, padding: 20, opacity: visible }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: C.chestnut, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.white }}>AI</div>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.chestnut, fontFamily: FONT.sans }}>智能建议</span>
      </div>
      <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, fontFamily: FONT.sans }}>{d.aiSuggestion}</div>
    </div>
  )
}

const ActionPlan: React.FC<{ d: typeof GROWTH_DATA_V2; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const visible = fadeIn(frame, fps, 13, 0.5)
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20, opacity: visible }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 12, letterSpacing: 1 }}>本周计划</div>
      {d.planItems.map((item, i) => {
        const itemOpacity = fadeIn(frame, fps, 14 + i * 0.5, 0.3)
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, opacity: itemOpacity }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${C.chestnut}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: C.chestnut, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
            <span style={{ fontSize: 13, color: C.ink, fontFamily: FONT.sans }}>{item}</span>
          </div>
        )
      })}
    </div>
  )
}

export default GrowthScene
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (in `video/`)

---

## Task 7: Create ReportScene (20s)

**Files:**
- Create: `video/src/scenes/ReportScene.tsx`

- [ ] **Step 1: Write ReportScene**

Three phases: Cover (0-5s) → Chapter flip (5-13s) → Action plan (13-20s). Uses ChapterTitle, DropCap, PaperCard, ReportActionItem from UIPrimitives.

```typescript
import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, Easing } from 'remotion'
import { C, FONT } from '../tokens'
import { REPORT_DATA } from '../content'
import { MiniNavbar, ChapterTitle, DropCap, PaperCard, ReportActionItem, fadeIn, delayFrame, slideUp } from '../components/UIPrimitives'

const ReportScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = REPORT_DATA

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar activeLabel="职业报告" />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, letterSpacing: 1, marginBottom: 16, opacity: fadeIn(frame, fps, 0, 0.4) }}>
          06 · 职业报告
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 32 }}>
          <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <CoverPage d={d} frame={frame} fps={fps} />
            <ChaptersView d={d} frame={frame} fps={fps} />
          </div>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ActionPlanView d={d} frame={frame} fps={fps} />
            <EvidenceChain frame={frame} fps={fps} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const CoverPage: React.FC<{ d: typeof REPORT_DATA; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const anim = slideUp(frame, fps, 0.2, 0.6, 14)
  const targetVisible = fadeIn(frame, fps, 1, 0.5)

  return (
    <div style={{ opacity: anim.opacity, transform: `translateY(${anim.translateY}px)`, display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.ink, fontFamily: FONT.sans, lineHeight: 1.3 }}>{d.title}</div>
        <div style={{ fontSize: 14, color: C.inkMuted, marginTop: 8, fontFamily: FONT.sans }}>{d.date}</div>
      </div>
      <div style={{ opacity: targetVisible, padding: '10px 20px', borderRadius: 12, backgroundColor: `${C.chestnut}12`, border: `1px solid ${C.chestnut}30` }}>
        <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>目标岗位</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.chestnut, fontFamily: FONT.sans }}>{d.target}</div>
      </div>
    </div>
  )
}

const ChaptersView: React.FC<{ d: typeof REPORT_DATA; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const chapterStart = 5
  const activeIdx = Math.min(
    d.chapters.length - 1,
    Math.floor(
      Math.max(0, frame - chapterStart * fps) / (2 * fps)
    )
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {d.chapters.map((ch, i) => {
        const isActive = i === activeIdx && frame >= chapterStart * fps
        const isPast = i < activeIdx && frame >= chapterStart * fps
        const opacity = isPast ? 0.5 : isActive ? fadeIn(frame, fps, chapterStart + i * 2, 0.5) : frame >= chapterStart * fps ? 0.2 : 0
        const scale = isActive ? 1.02 : 1

        return (
          <div key={i} style={{ opacity, transform: `scale(${scale})`, transition: 'none' }}>
            <PaperCard delay={isActive ? chapterStart + i * 2 : 99}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: isActive ? C.chestnut : C.line, fontFamily: FONT.sans, lineHeight: 1 }}>{ch.numeral}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, fontFamily: FONT.sans, marginBottom: 4 }}>{ch.title}</div>
                  <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5, fontFamily: FONT.sans, maxHeight: 40, overflow: 'hidden' }}>{ch.summary}</div>
                </div>
              </div>
            </PaperCard>
          </div>
        )
      })}
    </div>
  )
}

const ActionPlanView: React.FC<{ d: typeof REPORT_DATA; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const visible = fadeIn(frame, fps, 13, 0.5)
  return (
    <div style={{ opacity: visible }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>行动计划</div>
      {d.actionPlan.map((item, i) => (
        <ReportActionItem key={i} task={item.task} deadline={item.deadline} evidence={item.evidence} index={i} delay={13.3} />
      ))}
    </div>
  )
}

const EvidenceChain: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const visible = fadeIn(frame, fps, 16, 0.5)
  const chain = ['简历', '画像', '岗位', 'JD', '面试', '成长', '报告']

  return (
    <div style={{ backgroundColor: `${C.chestnut}08`, border: `1px solid ${C.chestnut}20`, borderRadius: 16, padding: 20, opacity: visible, marginTop: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.chestnut, marginBottom: 10, letterSpacing: 1 }}>证据链闭环</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {chain.map((item, i) => {
          const itemOpacity = fadeIn(frame, fps, 16.3 + i * 0.2, 0.3)
          return (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: C.line, fontSize: 12, opacity: itemOpacity }}>→</span>}
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 8, backgroundColor: i === chain.length - 1 ? C.chestnut : C.paper2, color: i === chain.length - 1 ? C.white : C.ink2, fontWeight: 600, fontFamily: FONT.sans, opacity: itemOpacity }}>
                {item}
              </span>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default ReportScene
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (in `video/`)

---

## Task 8: Update CTA and Composition

**Files:**
- Modify: `video/src/scenes/CTAScene.tsx`
- Modify: `video/src/Composition.tsx`

- [ ] **Step 1: Update CTAScene.tsx — extend to 10s and use CTA_V2**

In CTAScene.tsx, replace the `CTA` import with `CTA_V2` from content, and adjust the glow timing:

```typescript
import { CTA_V2 } from '../content'
// ... replace all references to CTA.headline → CTA_V2.headline, CTA.sub → CTA_V2.sub, CTA.url → CTA_V2.url
```

Change the glow animation to span 8 seconds instead of 4:
```typescript
const glowSize = interpolate(frame, [0, 8 * fps], [400, 900], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
```

- [ ] **Step 2: Rewrite Composition.tsx with new 7-scene timeline**

```typescript
import React from 'react'
import { Sequence, AbsoluteFill } from 'remotion'
import { FPS } from './tokens'
import { UPLOAD_PROFILE_DATA, GRAPH_JD_DATA, INTERVIEW_AI_DATA, GROWTH_DATA_V2, REPORT_DATA } from './content'
import HookScene from './scenes/HookScene'
import UploadProfileScene from './scenes/UploadProfileScene'
import GraphJDScene from './scenes/GraphJDScene'
import InterviewAIScene from './scenes/InterviewAIScene'
import GrowthScene from './scenes/GrowthScene'
import ReportScene from './scenes/ReportScene'
import CTAScene from './scenes/CTAScene'

const HOOK_DUR = 8
const UPLOAD_PROFILE_DUR = UPLOAD_PROFILE_DATA.duration
const GRAPH_JD_DUR = GRAPH_JD_DATA.duration
const INTERVIEW_AI_DUR = INTERVIEW_AI_DATA.duration
const GROWTH_DUR = GROWTH_DATA_V2.duration
const REPORT_DUR = REPORT_DATA.duration
const CTA_DUR = 10

export const TOTAL_DUR =
  (HOOK_DUR + UPLOAD_PROFILE_DUR + GRAPH_JD_DUR + INTERVIEW_AI_DUR + GROWTH_DUR + REPORT_DUR + CTA_DUR) * FPS

export const CareerOSVideo: React.FC = () => {
  const hookStart = 0
  const uploadProfileStart = hookStart + HOOK_DUR * FPS
  const graphJDStart = uploadProfileStart + UPLOAD_PROFILE_DUR * FPS
  const interviewAIStart = graphJDStart + GRAPH_JD_DUR * FPS
  const growthStart = interviewAIStart + INTERVIEW_AI_DUR * FPS
  const reportStart = growthStart + GROWTH_DUR * FPS
  const ctaStart = reportStart + REPORT_DUR * FPS

  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1714' }}>
      <Sequence from={hookStart} durationInFrames={HOOK_DUR * FPS}>
        <HookScene />
      </Sequence>
      <Sequence from={uploadProfileStart} durationInFrames={UPLOAD_PROFILE_DUR * FPS}>
        <UploadProfileScene />
      </Sequence>
      <Sequence from={graphJDStart} durationInFrames={GRAPH_JD_DUR * FPS}>
        <GraphJDScene />
      </Sequence>
      <Sequence from={interviewAIStart} durationInFrames={INTERVIEW_AI_DUR * FPS}>
        <InterviewAIScene />
      </Sequence>
      <Sequence from={growthStart} durationInFrames={GROWTH_DUR * FPS}>
        <GrowthScene />
      </Sequence>
      <Sequence from={reportStart} durationInFrames={REPORT_DUR * FPS}>
        <ReportScene />
      </Sequence>
      <Sequence from={ctaStart} durationInFrames={CTA_DUR * FPS}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (in `video/`)
Expected: PASS

---

## Task 9: Render and verify

**Files:** None (verification only)

- [ ] **Step 1: Render the video**

Run: `npx remotion render CareerOS out/careeros-demo.mp4` (in `video/`)
Expected: 115s video, 3450 frames at 30fps, rendered to `video/out/careeros-demo.mp4`

- [ ] **Step 2: Check output file**

Verify the file exists and is a reasonable size (likely 5-8 MB for 115s).

- [ ] **Step 3: Commit all changes**

```bash
git add video/src/content.ts video/src/Composition.tsx video/src/scenes/UploadProfileScene.tsx video/src/scenes/GraphJDScene.tsx video/src/scenes/InterviewAIScene.tsx video/src/scenes/GrowthScene.tsx video/src/scenes/ReportScene.tsx video/src/components/UIPrimitives.tsx video/src/scenes/CTAScene.tsx docs/
git commit -m "feat(video): restructure demo video to story-driven 115s narrative"
```
