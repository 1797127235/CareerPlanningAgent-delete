import React from 'react'
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion'
import { GRAPH_JD_DATA } from '../content'
import { BG, C, FONT, FPS } from '../tokens'
import { easeOutExpo, progressBetween } from '../motion/cinematic'
import { AgentPanel } from '../components/AgentPanel'
import {
  panelGlowOrb,
  panelTopLine,
  premiumPanel,
  screenVignette,
  sectionEyebrowText,
  sectionRailLine,
  sectionSubtitleText,
  sectionTitleText,
  trailTag,
} from '../visualSystem'

const graphNodes = [
  { id: 'target', label: '前端开发', x: 780, y: 360, tier: 0, active: true },
  { id: 'react', label: 'React', x: 574, y: 212, tier: 1 },
  { id: 'ts', label: 'TypeScript', x: 952, y: 222, tier: 1 },
  { id: 'css', label: 'CSS 工程化', x: 528, y: 512, tier: 1 },
  { id: 'perf', label: '性能优化', x: 968, y: 486, tier: 1 },
  { id: 'ssr', label: 'SSR / SSG', x: 1156, y: 352, tier: 2 },
  { id: 'design', label: '系统设计', x: 784, y: 110, tier: 2 },
  { id: 'node', label: 'Node.js', x: 340, y: 360, tier: 2 },
  { id: 'ux', label: '交互体验', x: 676, y: 612, tier: 2 },
  { id: 'collab', label: '协作交付', x: 1084, y: 610, tier: 3 },
]

const graphEdges = [
  ['react', 'target'],
  ['ts', 'target'],
  ['css', 'target'],
  ['perf', 'target'],
  ['design', 'target'],
  ['ssr', 'target'],
  ['node', 'target'],
  ['ux', 'target'],
  ['perf', 'ssr'],
  ['react', 'ux'],
  ['ts', 'design'],
  ['node', 'design'],
  ['ux', 'collab'],
]

const nodeMap: Record<string, (typeof graphNodes)[number]> = {}
graphNodes.forEach((node) => {
  nodeMap[node.id] = node
})

const jdLines = [
  { text: 'React 高级模式', sub: 'Hooks、渲染性能、状态拆分', matched: false, level: '需要补强' },
  { text: 'TypeScript', sub: '类型系统、泛型、工程规范', matched: true, level: '已有基础' },
  { text: '系统设计', sub: '模块边界、微前端、组件架构', matched: false, level: '关键缺口' },
  { text: 'SSR / SSG', sub: 'Next.js、首屏性能、SEO', matched: false, level: '关键缺口' },
  { text: '性能优化', sub: '加载速度、运行时指标、监控', matched: true, level: '具备信号' },
]

const profileSignals = [
  { name: 'React', value: 78, hit: true },
  { name: 'TypeScript', value: 72, hit: true },
  { name: 'CSS', value: 70, hit: true },
  { name: 'Node.js', value: 48, hit: false },
  { name: '系统设计', value: 45, hit: false },
]

const routeCandidates = [
  {
    id: 'fe',
    label: '前端开发工程师',
    short: '前端开发',
    scoreStart: 63,
    scorePeak: 92,
    scoreEnd: 92,
    state: '已锁定',
    x: 728,
    y: 286,
    strong: true,
  },
  {
    id: 'fs',
    label: '全栈开发工程师',
    short: '全栈开发',
    scoreStart: 61,
    scorePeak: 76,
    scoreEnd: 75,
    state: '可选目标',
    x: 728,
    y: 372,
    strong: false,
  },
  {
    id: 'mobile',
    label: '移动端开发工程师',
    short: '移动端开发',
    scoreStart: 56,
    scorePeak: 68,
    scoreEnd: 67,
    state: '可选目标',
    x: 728,
    y: 458,
    strong: false,
  },
]

export const GraphJDScene: React.FC = () => {
  const frame = useCurrentFrame()
  const graphEnd = 8 * FPS
  const targetEnd = 11 * FPS

  return (
    <AbsoluteFill style={{ fontFamily: FONT.sans, overflow: 'hidden' }}>
      {frame < targetEnd ? (
        <GraphPositioningAct frame={frame} graphEnd={graphEnd} targetEnd={targetEnd} />
      ) : (
        <JdJudgmentAct frame={frame - targetEnd} />
      )}
    </AbsoluteFill>
  )
}

const StageFocusHeader: React.FC<{
  eyebrow: string
  title: string
  subtitle: string
  trail: string
}> = ({ eyebrow, title, subtitle, trail }) => {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 88,
          top: 48,
          width: 520,
          zIndex: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={sectionRailLine} />
          <div style={sectionEyebrowText}>{eyebrow}</div>
        </div>
        <div style={{ marginTop: 18, ...sectionTitleText() }}>{title}</div>
        <div style={sectionSubtitleText}>{subtitle}</div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 88,
          top: 56,
          ...trailTag('scan'),
          fontSize: 12,
          zIndex: 24,
        }}
      >
        {trail}
      </div>
    </>
  )
}

const GraphPositioningAct: React.FC<{
  frame: number
  graphEnd: number
  targetEnd: number
}> = ({ frame, graphEnd, targetEnd }) => {
  const appearP = (i: number) => progressBetween(frame, 4 + i * 4, 22 + i * 5, easeOutExpo)
  const signalP = progressBetween(frame, 0, 2.2 * FPS, easeOutExpo)
  const stageP = progressBetween(frame, 0.5 * FPS, 3.2 * FPS, easeOutExpo)
  const scoreShiftP = progressBetween(frame, 2.1 * FPS, graphEnd - 6, easeOutExpo)
  const confirmP = progressBetween(frame, graphEnd - 8, targetEnd, easeOutExpo)
  const confirmCardP = progressBetween(frame, 4.2 * FPS, 6.2 * FPS, easeOutExpo)
  const targetLockP = progressBetween(frame, 7.8 * FPS, targetEnd - 4, easeOutExpo)
  const targetPulse = 0.72 + 0.28 * Math.sin(frame / 8)

  const routeScore = (route: (typeof routeCandidates)[number]) => {
    const live =
      route.id === 'fe'
        ? interpolate(scoreShiftP, [0, 0.2, 0.52, 0.76, 1], [63, 66, 82, 89, 92])
        : route.id === 'fs'
          ? interpolate(scoreShiftP, [0, 0.18, 0.46, 0.74, 1], [61, 69, 78, 76, 75])
          : interpolate(scoreShiftP, [0, 0.24, 0.56, 0.8, 1], [56, 60, 69, 68, 67])
    return interpolate(confirmP, [0, 1], [live, route.scoreEnd])
  }

  const rankedRoutes = [...routeCandidates]
    .map((route) => ({ ...route, liveScore: routeScore(route) }))
    .sort((a, b) => b.liveScore - a.liveScore)

  const rankMap = rankedRoutes.reduce<Record<string, number>>((acc, route, index) => {
    acc[route.id] = index
    return acc
  }, {})

  return (
    <AbsoluteFill style={{ background: BG.scan }}>
      <div style={{ ...screenVignette(0.28), zIndex: 1 }} />
      <GraphAtmosphere frame={frame} />
      <StageFocusHeader
        eyebrow="岗位推荐"
        title="选择目标岗位"
        subtitle="系统先基于学生画像推荐更匹配的岗位，学生再从推荐结果里选定一个目标岗位。"
        trail="画像信号 → 岗位推荐 → 目标岗位"
      />

      <div
        style={{
          left: 92,
          top: 210,
          width: 296,
          padding: '26px 26px 24px',
          ...premiumPanel('scan'),
          position: 'absolute',
          opacity: signalP * (1 - confirmP * 0.78),
          transform: `translateY(${(1 - signalP) * 16 - confirmP * 8}px) scale(${1 - confirmP * 0.04})`,
          zIndex: 15,
          boxShadow: '0 18px 40px rgba(0,0,0,0.22)',
        }}
      >
        <div style={panelTopLine('scan')} />
        <div style={panelGlowOrb('scan', { size: 180, right: -50, top: -60, opacity: 0.12 })} />
        <div style={{ fontSize: 11, fontWeight: 800, color: C.chestnut, letterSpacing: 1.7, fontFamily: FONT.mono }}>
          画像信号
        </div>
        <div style={{ marginTop: 18, fontSize: 34, lineHeight: 1.04, fontWeight: 900, color: C.white, letterSpacing: -1.4 }}>
          系统开始推荐
          <br />
          匹配岗位
        </div>
        <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {['React', 'TypeScript', 'CSS', '前端倾向', '协作项目'].map((item, i) => {
            const chipP = progressBetween(frame, 10 + i * 3, 34 + i * 4, easeOutExpo)
            return (
              <div
                key={item}
                style={{
                  padding: '7px 11px',
                  border: '1px solid rgba(107,163,190,0.12)',
                  backgroundColor: 'rgba(107,163,190,0.05)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.white,
                  opacity: chipP,
                  transform: `translateY(${(1 - chipP) * 10}px)`,
                }}
              >
                {item}
              </div>
            )
          })}
        </div>
      </div>

      <SignalStream frame={frame} />
      <ActiveEdgePulses frame={frame} />

      <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <line x1={356} y1={196} x2={1210} y2={196} stroke="rgba(247,241,235,0.04)" strokeWidth={1} />
          <line x1={356} y1={360} x2={1210} y2={360} stroke="rgba(247,241,235,0.05)" strokeWidth={1} />
          <line x1={356} y1={532} x2={1210} y2={532} stroke="rgba(247,241,235,0.04)" strokeWidth={1} />
          <line x1={780} y1={124} x2={780} y2={610} stroke="rgba(247,241,235,0.035)" strokeWidth={1} />
          <line x1={1042} y1={154} x2={1042} y2={594} stroke="rgba(247,241,235,0.03)" strokeWidth={1} />

          {graphEdges.map(([fromId, toId], i) => {
            const from = nodeMap[fromId]
            const to = nodeMap[toId]
            if (!from || !to) return null
            const p = appearP(i)
            const targetLinked = fromId === 'target' || toId === 'target'

            return (
              <line
                key={`${fromId}-${toId}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={targetLinked ? C.scan : C.inkMuted}
                strokeWidth={targetLinked ? 2.2 : 1}
                strokeOpacity={p * (targetLinked ? 0.22 + stageP * 0.38 : 0.08)}
              />
            )
          })}
        </svg>

        <div
          style={{
            position: 'absolute',
            left: 438,
            top: 176,
            width: 640,
            height: 356,
            background: 'linear-gradient(90deg, rgba(107,163,190,0.05) 0%, rgba(107,163,190,0.015) 36%, rgba(107,163,190,0.03) 100%)',
            border: '1px solid rgba(107,163,190,0.08)',
            opacity: 0.34,
            boxShadow: 'inset 0 0 80px rgba(107,163,190,0.03)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 474,
            top: 210,
            width: 570,
            height: 288,
            border: '1px solid rgba(247,241,235,0.05)',
            opacity: 0.28,
          }}
        />
        <CentralCandidateCluster
          frame={frame}
          introP={stageP}
          collapseP={confirmP}
          targetLockP={targetLockP}
          routeScore={routeScore}
          rankMap={rankMap}
        />

        {graphNodes.map((node, i) => {
          const p = appearP(i)
          const isTarget = node.id === 'target'
          const targetRevealP = targetLockP
          const targetFade = targetRevealP * 0.22
          const scale = isTarget ? 0.9 + p * 0.08 + targetRevealP * 0.12 : 0.86 + p * 0.14
          const nodeOpacity = isTarget ? targetFade + targetRevealP * 0.7 : p * (0.88 - targetLockP * (node.tier === 1 ? 0.34 : 0.46))

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity: nodeOpacity,
                zIndex: isTarget ? 16 : 10,
              }}
            >
              {isTarget ? (
                <div
                  style={{
                    position: 'relative',
                    padding: '22px 34px 24px',
                    background: 'linear-gradient(180deg, rgba(107,163,190,0.2) 0%, rgba(107,163,190,0.06) 100%)',
                    border: `1px solid rgba(107,163,190,${0.18 + targetPulse * 0.14})`,
                    boxShadow: `0 0 34px rgba(107,163,190,0.18), 0 0 120px rgba(107,163,190,0.08), inset 0 0 40px rgba(107,163,190,0.06)`,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: -10,
                      border: `1px solid rgba(107,163,190,${0.16 + targetPulse * 0.12})`,
                      opacity: 0.65,
                    }}
                  />
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.scan, fontFamily: FONT.mono, letterSpacing: 1.7 }}>
                    目标岗位
                  </div>
                  <div style={{ marginTop: 8, fontSize: 44, lineHeight: 0.95, fontWeight: 900, color: C.white, letterSpacing: -2.2, textShadow: `0 0 22px ${C.scanGlow}` }}>
                    {node.label}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(247,241,235,0.035)',
                    border: '1px solid rgba(247,241,235,0.08)',
                    color: C.white,
                    fontSize: node.tier === 1 ? 17 : 14,
                    fontWeight: node.tier === 1 ? 800 : 700,
                    whiteSpace: 'nowrap',
                    boxShadow: node.tier === 1 ? '0 0 20px rgba(107,163,190,0.06)' : 'none',
                  }}
                >
                  {node.label}
                </div>
              )}
            </div>
          )
        })}
      </div>

        <div
          style={{
            right: 110,
            top: 248,
            width: 288,
            padding: '22px 22px 20px',
            ...premiumPanel('scan'),
            position: 'absolute',
            opacity: 0.98,
            transform: `translateY(${(1 - progressBetween(frame, 20, targetEnd)) * 12 - confirmP * 4}px) scale(${1 - confirmP * 0.03})`,
            zIndex: 16,
            boxShadow: '0 18px 40px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(247,241,235,0.04)',
            border: '1px solid rgba(247,241,235,0.12)',
          }}
        >
        <div style={panelTopLine('scan')} />
        <div style={{ fontSize: 11, fontWeight: 800, color: C.scan, letterSpacing: 1.7, fontFamily: FONT.mono }}>
          推荐岗位收敛
        </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rankedRoutes.slice(0, 3).map((route, i) => {
              const p = progressBetween(frame, 26 + i * 6, targetEnd + i * 2, easeOutExpo)
              const score = Math.round(route.liveScore)
              const state = i === 0 ? '优先推荐' : '可选目标'
              return (
                <div
                  key={route.label}
                style={{
                  opacity: route.strong ? p : p,
                  transform: `translateX(${(1 - p) * 14}px)`,
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          color: i === 0 ? C.scan : C.inkMuted,
                          fontFamily: FONT.mono,
                          letterSpacing: 1.2,
                        }}
                      >
                        TOP {i + 1}
                      </div>
                        <div style={{ fontSize: 16, fontWeight: i === 0 ? 800 : 700, color: C.white }}>
                          {route.label}
                        </div>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                          color: i === 0 ? C.scan : C.inkMuted,
                        fontFamily: FONT.mono,
                        letterSpacing: 1.1,
                      }}
                  >
                    {state}
                  </div>
                </div>
                <div style={{ marginTop: 8, height: 4, backgroundColor: 'rgba(247,241,235,0.05)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${score * p}%`,
                      height: '100%',
                      backgroundColor: i === 0 ? C.scan : 'rgba(247,241,235,0.22)',
                      boxShadow: i === 0 ? `0 0 18px ${C.scanGlow}` : 'none',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

      </div>

      <div
        style={{
          position: 'absolute',
          left: 110,
          bottom: 86,
          width: 420,
          opacity: progressBetween(frame, 3.8 * FPS, 6.1 * FPS, easeOutExpo),
          transform: `translateY(${(1 - progressBetween(frame, 3.8 * FPS, 6.1 * FPS, easeOutExpo)) * 14}px)`,
          zIndex: 18,
        }}
      >
        <div
          style={{
            padding: '14px 4px',
          }}
        >
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.1,
              fontWeight: 900,
              color: C.white,
              letterSpacing: -1.2,
            }}
          >
            目标岗位：{' '}
            <span style={{ color: C.scan }}>前端开发工程师</span>
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.55,
              color: C.inkMuted,
              fontWeight: 600,
            }}
          >
            推荐结果已确认 · 学生已选定目标岗位
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 110,
          bottom: 82,
          width: 560,
          opacity: confirmCardP,
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '18px 22px 20px',
            ...premiumPanel('resolve'),
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            transform: `translateY(${(1 - confirmCardP) * 16}px)`,
            border: '1px solid rgba(247,241,235,0.12)',
            boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: C.chestnut,
              letterSpacing: 1.7,
              fontFamily: FONT.mono,
            }}
          >
            CareerOS 智能体
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.5, color: C.white, fontWeight: 800 }}>
            系统先推荐更匹配的岗位；目标确认后，再结合上传的真实 JD 做差距分析。
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: C.inkMuted }}>
            这里不是替你自动决定。CareerOS 会先基于画像整理候选岗位，等你选定目标岗位后，再把注意力集中到那份岗位对应的真实 JD 上。
          </div>
          <div style={{ marginTop: 2, display: 'flex', gap: 10 }}>
            {['推荐候选岗位', '等待学生确认', '下一步：分析目标 JD'].map((item) => (
              <div
                key={item}
                style={{
                  padding: '6px 10px',
                  border: '1px solid rgba(247,241,235,0.08)',
                  backgroundColor: 'rgba(247,241,235,0.025)',
                  fontSize: 12,
                  color: C.white,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const JdJudgmentAct: React.FC<{ frame: number }> = ({ frame }) => {
  const d = GRAPH_JD_DATA
  const scanP = progressBetween(frame, 0, 4.8 * FPS)
  const compareP = progressBetween(frame, 3.6 * FPS, 7.4 * FPS)
  const verdictP = progressBetween(frame, 6.8 * FPS, 9.2 * FPS, easeOutExpo)
  const gapP = progressBetween(frame, 8.8 * FPS, 12.4 * FPS, easeOutExpo)
  const evidenceP = progressBetween(frame, 11.8 * FPS, 14.5 * FPS)
  const scanY = 168 + scanP * 318
  const gapCount = d.gapSkills.length
  const agentP = progressBetween(frame, 6.6 * FPS, 10.6 * FPS, easeOutExpo)
  const evidenceCards = [
    {
      title: '来自画像信号',
      body: '系统已经识别出学生的前端倾向、项目经历与核心技术基础。',
    },
    {
      title: '来自真实 JD',
      body: '判断依据不是抽象标签，而是学生上传的真实岗位要求。',
    },
    {
      title: '来自能力映射',
      body: '系统会把画像能力和 JD 要求逐项对照，定位关键缺口。',
    },
  ]

  return (
    <AbsoluteFill style={{ background: BG.verdict }}>
      <div style={{ ...screenVignette(0.32), zIndex: 1 }} />
      <JudgmentAtmosphere frame={frame} verdictP={verdictP} />
      <StageFocusHeader
        eyebrow="差距判断"
        title="判断目标 JD 差距"
        subtitle="学生上传真实 JD 后，系统把 JD 要求和学生画像逐项对照，识别已具备部分、关键缺口和建议依据。"
        trail="上传目标 JD → 判断差距 → 给出建议"
      />

      <div
        style={{
          left: 88,
          top: 214,
          width: 620,
          padding: '24px 24px 22px',
          ...premiumPanel('neutral'),
          position: 'absolute',
          zIndex: 12,
        }}
      >
        <div style={panelTopLine('verdict')} />
        <div style={{ fontSize: 10, fontWeight: 800, color: C.chestnut, letterSpacing: 1.6, fontFamily: FONT.mono }}>
          上传 JD
        </div>
        <div style={{ marginTop: 10, fontSize: 30, lineHeight: 1.06, fontWeight: 900, color: C.white }}>
          前端开发工程师
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: C.inkMuted, fontFamily: FONT.mono }}>
          互联网产品团队 · 真实岗位要求切片
        </div>

        <div style={{ position: 'relative', marginTop: 22 }}>
          {jdLines.map((line, i) => {
            const rowTop = i * 64
            const rowP = progressBetween(frame, 8 + i * 5, 32 + i * 6, easeOutExpo)
            const resultP = progressBetween(frame, 4.4 * FPS + i * 4, 7.2 * FPS + i * 4, easeOutExpo)
            const showGap = compareP > 0.34 && !line.matched
            const showHit = compareP > 0.34 && line.matched
            const isCurrent = scanY >= 168 + rowTop && scanY < 168 + rowTop + 60
            const targetBorder = showGap ? C.gapSharp : showHit ? C.hit : 'rgba(247,241,235,0.04)'
            const targetBg = showGap ? C.gapDim : showHit ? C.hitDim : 'rgba(247,241,235,0.01)'
            const targetBadgeBorder = showGap
              ? 'rgba(245,166,102,0.22)'
              : showHit
                ? 'rgba(113,213,178,0.2)'
                : 'rgba(247,241,235,0.08)'
            const targetBadgeColor = showGap ? C.gapSharp : showHit ? C.hit : C.inkMuted
            const borderColor = isCurrent
              ? interpolateColors(resultP, [0, 1], [C.scan, targetBorder])
              : interpolateColors(resultP, [0, 1], ['transparent', targetBorder])
            const rowBg = isCurrent
              ? interpolateColors(resultP, [0, 1], [C.scanDim, targetBg])
              : interpolateColors(resultP, [0, 1], ['rgba(247,241,235,0.01)', targetBg])
            const badgeBorder = isCurrent
              ? interpolateColors(resultP, [0, 1], ['rgba(107,163,190,0.22)', targetBadgeBorder])
              : interpolateColors(resultP, [0, 1], ['rgba(247,241,235,0.08)', targetBadgeBorder])
            const badgeColor = isCurrent
              ? interpolateColors(resultP, [0, 1], [C.scan, targetBadgeColor])
              : interpolateColors(resultP, [0, 1], [C.inkMuted, targetBadgeColor])

            return (
              <div
                key={line.text}
                style={{
                  height: 58,
                  marginBottom: 6,
                  padding: '0 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: `3px solid ${borderColor}`,
                  backgroundColor: rowBg,
                  opacity: 0.22 + rowP * 0.78,
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.white }}>{line.text}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: C.inkMuted }}>{line.sub}</div>
                </div>
                <div
                  style={{
                    padding: '4px 9px',
                    border: `1px solid ${badgeBorder}`,
                    fontSize: 10,
                    fontWeight: 800,
                    color: badgeColor,
                    fontFamily: FONT.mono,
                    letterSpacing: 1.1,
                    boxShadow: isCurrent ? `0 0 14px rgba(107,163,190,0.08)` : 'none',
                  }}
                >
                  {line.level}
                </div>
              </div>
            )
          })}

          {scanP < 1 ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: scanY - 168,
                height: 2,
                backgroundColor: C.scan,
                boxShadow: `0 0 12px ${C.scanGlow}, 0 0 28px ${C.scanGlow}`,
              }}
            />
          ) : null}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 742,
          top: 238,
          width: 360,
          padding: '20px 20px 22px',
          backgroundColor: 'rgba(247,241,235,0.02)',
          border: '1px solid rgba(247,241,235,0.06)',
          opacity: compareP,
          transform: `translateY(${(1 - compareP) * 18}px)`,
          zIndex: 14,
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 800, color: C.scan, letterSpacing: 1.6, fontFamily: FONT.mono }}>
          画像对照
        </div>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {profileSignals.map((signal, i) => {
            const p = progressBetween(frame, 4.4 * FPS + i * 4, 7.8 * FPS + i * 4, easeOutExpo)
            return (
              <div key={signal.name} style={{ opacity: p, transform: `translateX(${(1 - p) * 18}px)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: signal.hit ? C.white : C.gapSharp }}>
                    {signal.name}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: signal.hit ? C.hit : C.gapSharp, fontFamily: FONT.mono }}>
                    {Math.round(signal.value * p)}
                  </div>
                </div>
                <div style={{ marginTop: 8, height: 4, backgroundColor: 'rgba(247,241,235,0.05)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${signal.value * p}%`,
                      height: '100%',
                      backgroundColor: signal.hit ? C.hit : C.gapSharp,
                      boxShadow: signal.hit ? 'none' : `0 0 18px ${C.gapDim}`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 742,
          top: 586,
          width: 360,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          opacity: compareP,
          zIndex: 14,
        }}
      >
        {['React', 'TypeScript', 'CSS', '项目经验', '前端倾向'].map((item, i) => {
          const p = progressBetween(frame, 4.8 * FPS + i * 3, 7.9 * FPS + i * 3)
          return (
            <div
              key={item}
              style={{
                padding: '7px 12px',
                border: '1px solid rgba(113,213,178,0.18)',
                backgroundColor: 'rgba(113,213,178,0.06)',
                fontSize: 12,
                fontWeight: 700,
                color: C.hit,
                opacity: p,
                transform: `translateY(${(1 - p) * 10}px)`,
              }}
            >
              {item}
            </div>
          )
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          right: 88,
          top: 214,
          width: 390,
          padding: '28px 28px 26px',
          background: 'linear-gradient(180deg, rgba(247,241,235,0.03) 0%, rgba(247,241,235,0.012) 100%)',
          border: '1px solid rgba(247,241,235,0.06)',
          opacity: verdictP,
          transform: `translateY(${(1 - verdictP) * 20}px) scale(${0.96 + verdictP * 0.04})`,
          zIndex: 18,
          boxShadow: verdictP > 0.9 ? `0 0 80px rgba(107,163,190,0.08)` : 'none',
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 800, color: C.chestnut, letterSpacing: 1.6, fontFamily: FONT.mono }}>
          判定结果
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 76,
            lineHeight: 0.92,
            fontWeight: 900,
            color: C.verdict,
            letterSpacing: -3.2,
            textShadow: `0 0 24px rgba(232,212,184,0.08)`,
          }}
        >
          可冲刺
        </div>
        <div style={{ marginTop: 14, fontSize: 24, lineHeight: 1.16, fontWeight: 800, color: C.white }}>
          {d.matchLabel}
        </div>
        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {[
            { label: '整体状态', value: '可以作为目标岗位' },
            { label: '当前建议', value: '先补齐再投递' },
            { label: '关键缺口', value: `${gapCount} 项` },
            { label: '建议依据', value: '画像 + 真实 JD' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(247,241,235,0.025)',
                border: '1px solid rgba(247,241,235,0.06)',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: C.inkMuted, letterSpacing: 1.2, fontFamily: FONT.mono }}>
                {item.label}
              </div>
              <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.3, fontWeight: 700, color: C.white }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, fontSize: 13, lineHeight: 1.5, color: C.inkMuted }}>
          系统判断这份画像可以接近目标 JD，但仍有 3 个会直接影响建议与后续成长路径的关键缺口。
        </div>
      </div>

      <AgentPanel
        left={1120}
        top={84}
        width={300}
        opacity={agentP}
        title="CareerOS 会重点找出真正影响投递的关键缺口。"
        detail="现在会把画像和真实 JD 逐项对照，不只给分数，而是判断哪些缺口会真正影响后面的行动建议。"
        tags={['已接收 JD', '逐项对照', '输出建议']}
      />

      <div
        style={{
          position: 'absolute',
          right: 88,
          top: 622,
          width: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: gapP,
          zIndex: 18,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: C.gapSharp, letterSpacing: 1.8, fontFamily: FONT.mono }}>
          关键缺口
        </div>
        {d.gapSkills.map((skill, i) => {
          const p = progressBetween(frame, 9.2 * FPS + i * 7, 12.6 * FPS + i * 7, easeOutExpo)
          return (
            <div
              key={skill}
              style={{
                padding: '16px 18px 15px',
                borderLeft: `4px solid ${C.gapSharp}`,
                backgroundColor: 'rgba(232, 151, 79, 0.1)',
                border: '1px solid rgba(232, 151, 79, 0.14)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                opacity: p,
                transform: `translateX(${(1 - p) * 24}px)`,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: C.gapSharp }}>{skill}</div>
              <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.45, color: C.ink }}>
                {i === 0
                  ? '需要补足更复杂的前端实现方式与工程表达。'
                  : i === 1
                    ? '需要补足模块拆分、系统边界与协作架构能力。'
                    : '需要补足首屏性能、服务端渲染与场景化落地。'}
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 88,
          bottom: 58,
          width: 760,
          opacity: evidenceP,
          zIndex: 18,
        }}
      >
        <div
          style={{
            padding: '18px 20px 20px',
            background: 'linear-gradient(180deg, rgba(107,163,190,0.04) 0%, rgba(107,163,190,0.015) 100%)',
            border: '1px solid rgba(107,163,190,0.12)',
            boxShadow: '0 14px 36px rgba(0,0,0,0.16)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: C.scan, letterSpacing: 1.8, fontFamily: FONT.mono }}>
            判断依据
          </div>
          <div style={{ marginTop: 10, fontSize: 22, lineHeight: 1.25, fontWeight: 800, color: C.white }}>
            这次差距判断不是只看分数，而是同时参考画像、真实 JD 与能力映射。
          </div>
          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {evidenceCards.map((item, i) => {
              const p = progressBetween(frame, 12.1 * FPS + i * 5, 14.6 * FPS + i * 5)
              return (
                <div
                  key={item.title}
                  style={{
                    minHeight: 106,
                    padding: '14px 14px 12px',
                    backgroundColor: 'rgba(247,241,235,0.025)',
                    border: '1px solid rgba(247,241,235,0.06)',
                    opacity: p,
                    transform: `translateY(${(1 - p) * 12}px)`,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.scan, letterSpacing: 1.2, fontFamily: FONT.mono }}>
                    {item.title}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.45, color: C.ink }}>
                    {item.body}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {d.evidence.map((item, i) => {
              const p = progressBetween(frame, 12.2 * FPS + i * 4, 14.8 * FPS + i * 4)
              return (
                <div
                  key={item}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid rgba(107,163,190,0.14)',
                    backgroundColor: 'rgba(107,163,190,0.05)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.white,
                    opacity: p,
                  }}
                >
                  {item}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const GraphAtmosphere: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = interpolate(frame, [0, 11 * FPS], [0, 1])

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 276 - drift * 12,
          top: 118,
          width: 1060,
          height: 540,
          background: 'linear-gradient(90deg, rgba(107,163,190,0.05) 0%, rgba(107,163,190,0.016) 38%, rgba(107,163,190,0.03) 100%)',
          filter: 'blur(30px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 330,
          top: 176 + drift * 8,
          width: 888,
          height: 1,
          background: 'linear-gradient(90deg, rgba(247,241,235,0) 0%, rgba(247,241,235,0.05) 28%, rgba(247,241,235,0.02) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 330,
          top: 550 - drift * 6,
          width: 888,
          height: 1,
          background: 'linear-gradient(90deg, rgba(247,241,235,0) 0%, rgba(247,241,235,0.035) 28%, rgba(247,241,235,0.015) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 84,
          top: 112,
          width: 344,
          height: 332,
          background: 'linear-gradient(180deg, rgba(247,241,235,0.018) 0%, rgba(247,241,235,0.008) 100%)',
          border: '1px solid rgba(247,241,235,0.04)',
          opacity: 0.3,
        }}
      />
    </>
  )
}

const CentralCandidateCluster: React.FC<{
  frame: number
  introP: number
  collapseP: number
  targetLockP: number
  routeScore: (route: (typeof routeCandidates)[number]) => number
  rankMap: Record<string, number>
}> = ({ frame, introP, collapseP, targetLockP, routeScore, rankMap }) => {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 14, pointerEvents: 'none' }}>
      {routeCandidates.map((route, i) => {
        const showP = progressBetween(frame, 18 + i * 5, 42 + i * 6, easeOutExpo)
        const score = routeScore(route)
        const rank = rankMap[route.id] ?? i
        const laneX = 824
        const laneY = 272 + rank * 90
        const x = route.x + (laneX - route.x) * introP
        const y = route.y + (laneY - route.y) * introP
        const fadeP = route.strong ? 1 - targetLockP * 0.96 : 1 - targetLockP * 1.08
        const scale = route.strong
          ? 0.92 + introP * 0.08 - targetLockP * 0.04
          : 0.9 + introP * 0.05 - collapseP * 0.04 - targetLockP * 0.03
        const opacity = showP * Math.max(0, fadeP)
        const laneGlow = rank === 0 ? 1 : 0.36
        const highlightP = route.strong ? 0.42 + collapseP * 0.4 : 0.2 + introP * 0.14

        return (
          <div
            key={route.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
            }}
          >
            <div
              style={{
                minWidth: route.strong ? 272 : 248,
                padding: route.strong ? '18px 18px 16px' : '14px 16px 14px',
                background: route.strong
                  ? 'linear-gradient(180deg, rgba(107,163,190,0.24) 0%, rgba(107,163,190,0.08) 100%)'
                  : 'linear-gradient(180deg, rgba(247,241,235,0.055) 0%, rgba(247,241,235,0.02) 100%)',
                border: route.strong
                  ? '1px solid rgba(107,163,190,0.24)'
                  : '1px solid rgba(247,241,235,0.08)',
                boxShadow: route.strong
                  ? `0 0 ${28 + highlightP * 22}px rgba(107,163,190,0.16), 0 0 84px rgba(107,163,190,0.08), inset 0 0 36px rgba(107,163,190,0.06)`
                  : '0 14px 28px rgba(0,0,0,0.18)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  backgroundColor: rank === 0 ? C.scan : 'rgba(247,241,235,0.18)',
                  boxShadow: rank === 0 ? `0 0 18px ${C.scanGlow}` : 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 20,
                  right: 20,
                  top: 0,
                  height: 1,
                  background: `linear-gradient(90deg, rgba(107,163,190,0) 0%, rgba(107,163,190,${0.16 * laneGlow}) 50%, rgba(107,163,190,0) 100%)`,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: rank === 0 ? C.scan : C.inkMuted,
                    fontFamily: FONT.mono,
                    letterSpacing: 1.2,
                  }}
                >
                  TOP {rank + 1} / 候选岗位
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: rank === 0 ? C.scan : C.inkMuted,
                      fontFamily: FONT.mono,
                      letterSpacing: 1.2,
                    }}
                  >
                    SCORE
                  </div>
                  <div
                    style={{
                      fontSize: route.strong ? 34 : 30,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: route.strong ? C.white : C.ink,
                      textShadow: route.strong ? `0 0 14px ${C.scanGlow}` : 'none',
                    }}
                  >
                    {Math.round(score)}
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    fontSize: route.strong ? 30 : 24,
                    lineHeight: 1,
                    fontWeight: 900,
                    color: route.strong ? C.white : C.ink,
                    letterSpacing: route.strong ? -1.8 : -1.2,
                  }}
                >
                  {route.short}
                </div>
                <div
                  style={{
                    padding: '5px 8px',
                    border: `1px solid ${rank === 0 ? 'rgba(107,163,190,0.18)' : 'rgba(247,241,235,0.08)'}`,
                    color: rank === 0 ? C.scan : C.inkMuted,
                    fontSize: 10,
                    fontWeight: 800,
                    fontFamily: FONT.mono,
                    letterSpacing: 1.1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {rank === 0 ? (collapseP > 0.62 ? '学生已选择' : '高匹配') : '可继续比较'}
                </div>
              </div>
              <div style={{ marginTop: 14, height: 5, backgroundColor: 'rgba(247,241,235,0.06)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${score * introP}%`,
                    height: '100%',
                    background: rank === 0
                      ? 'linear-gradient(90deg, rgba(107,163,190,0.55) 0%, rgba(107,163,190,1) 100%)'
                      : 'linear-gradient(90deg, rgba(247,241,235,0.14) 0%, rgba(247,241,235,0.26) 100%)',
                    boxShadow: rank === 0 ? `0 0 18px ${C.scanGlow}` : 'none',
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 6,
                }}
              >
                {new Array(5).fill(true).map((_, barIndex) => {
                  const active = score / 20 > barIndex
                  return (
                    <div
                      key={barIndex}
                      style={{
                        height: 3,
                        backgroundColor: active
                          ? rank === 0
                            ? `rgba(107,163,190,${0.3 + highlightP * 0.28})`
                            : 'rgba(247,241,235,0.18)'
                          : 'rgba(247,241,235,0.05)',
                        boxShadow: active && rank === 0 ? `0 0 10px ${C.scanGlow}` : 'none',
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const SignalStream: React.FC<{ frame: number }> = ({ frame }) => {
  const signals = [
    { startX: 358, startY: 240, endX: 640, endY: 306, delay: 0 },
    { startX: 356, startY: 286, endX: 652, endY: 336, delay: 6 },
    { startX: 358, startY: 332, endX: 664, endY: 362, delay: 12 },
    { startX: 360, startY: 378, endX: 654, endY: 388, delay: 18 },
    { startX: 360, startY: 424, endX: 640, endY: 418, delay: 24 },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none' }}>
      {signals.map((signal, i) => {
        const p = progressBetween(frame, 18 + signal.delay, 54 + signal.delay, easeOutExpo)
        const x = signal.startX + (signal.endX - signal.startX) * p
        const y = signal.startY + (signal.endY - signal.startY) * p

        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left: signal.startX,
                top: signal.startY,
                width: signal.endX - signal.startX,
                height: 1,
                background: 'linear-gradient(90deg, rgba(107,163,190,0) 0%, rgba(107,163,190,0.16) 30%, rgba(107,163,190,0.04) 100%)',
                opacity: p * 0.8,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: x - 5,
                top: y - 5,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: C.scan,
                boxShadow: `0 0 16px ${C.scanGlow}, 0 0 32px ${C.scanGlow}`,
                opacity: p * (1 - p * 0.2),
              }}
            />
          </React.Fragment>
        )
      })}
    </div>
  )
}

const ActiveEdgePulses: React.FC<{ frame: number }> = ({ frame }) => {
  const pulses = [
    { fromX: 574, fromY: 212, toX: 780, toY: 360, delay: 0 },
    { fromX: 952, fromY: 222, toX: 780, toY: 360, delay: 8 },
    { fromX: 528, fromY: 512, toX: 780, toY: 360, delay: 16 },
    { fromX: 968, fromY: 486, toX: 780, toY: 360, delay: 24 },
    { fromX: 340, fromY: 360, toX: 780, toY: 360, delay: 32 },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 12, pointerEvents: 'none' }}>
      {pulses.map((pulse, i) => {
        const p = progressBetween(frame, 26 + pulse.delay, 72 + pulse.delay, easeOutExpo)
        const x = pulse.fromX + (pulse.toX - pulse.fromX) * p
        const y = pulse.fromY + (pulse.toY - pulse.fromY) * p
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 6,
              top: y - 6,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: C.white,
              boxShadow: `0 0 18px ${C.scanGlow}, 0 0 42px ${C.scanGlow}`,
              opacity: p * (1 - p * 0.22),
            }}
          />
        )
      })}
    </div>
  )
}

const JudgmentAtmosphere: React.FC<{ frame: number; verdictP: number }> = ({ frame, verdictP }) => {
  const sweep = interpolate(frame, [0, 15 * FPS], [0, 1])

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 420,
          top: 80,
          width: 640,
          height: 640,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,163,190,0.06) 0%, rgba(107,163,190,0.015) 40%, transparent 72%)',
          opacity: 0.5 + verdictP * 0.2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 1080 - sweep * 120,
          top: 0,
          width: 400,
          height: 1080,
          background: 'linear-gradient(180deg, rgba(245,166,102,0) 0%, rgba(245,166,102,0.05) 34%, rgba(245,166,102,0) 100%)',
          opacity: 0.25,
          filter: 'blur(26px)',
        }}
      />
    </>
  )
}
