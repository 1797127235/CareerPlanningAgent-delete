import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from 'remotion'
import { C, FONT } from '../tokens'
import { GROWTH_DATA } from '../content'
import { SceneHeader, AnimatedCard, MiniNavbar, fadeIn, slideUp, delayFrame } from '../components/UIPrimitives'

const GrowthDemoScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = GROWTH_DATA

  const phase2Start = 2.5
  const phase3Start = 5
  const phase4Start = 7

  const statusColor = (status: string) => {
    switch (status) {
      case '进行中': return C.blue
      case '通过': case '已完成': return C.zoneSafe
      case '待完成': return C.accent
      default: return C.inkMuted
    }
  }

  const activeFilterIdx = Math.min(
    d.filters.length - 1,
    Math.floor(
      interpolate(frame, [0.5 * fps, 1.5 * fps], [0, d.filters.length - 0.01], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    )
  )

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar activeLabel="成长手札" />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <SceneHeader index={5} title="成长账本" desc="项目追踪 · 面试复盘 · AI 建议" delay={0} />

        <div style={{ flex: 1, display: 'flex', gap: 32 }}>
          {/* Left Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Quick Input */}
            <AnimatedCard delay={0.3}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>
                快速记录
              </div>
              <div
                style={{
                  padding: 14,
                  backgroundColor: C.paper2,
                  borderRadius: 12,
                  border: `1px solid ${C.lineSoft}`,
                  fontSize: 13,
                  color: C.inkMuted,
                  fontFamily: FONT.sans,
                  minHeight: 48,
                }}
              >
                <TypewriterLine text="完成 React 性能优化专题学习，掌握了 Profiler 使用方法" delay={0.6} speed={2.5} />
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {['学习', '性能优化', 'React'].map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 8,
                      backgroundColor: `${C.chestnut}10`,
                      color: C.chestnut,
                      fontWeight: 600,
                      opacity: fadeIn(frame, fps, 1.5 + i * 0.15, 0.3),
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </AnimatedCard>

            {/* Filter Chips */}
            <AnimatedCard delay={phase2Start}>
              <div style={{ display: 'flex', gap: 6 }}>
                {d.filters.map((filter, i) => {
                  const isActive = i === activeFilterIdx
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '5px 14px',
                        borderRadius: 16,
                        fontSize: 12,
                        fontWeight: isActive ? 700 : 500,
                        fontFamily: FONT.sans,
                        backgroundColor: isActive ? C.chestnut : C.paper2,
                        color: isActive ? C.white : C.ink2,
                        border: `1px solid ${isActive ? C.chestnut : C.lineSoft}`,
                        opacity: fadeIn(frame, fps, phase2Start + 0.2 + i * 0.08, 0.25),
                      }}
                    >
                      {filter}
                    </div>
                  )
                })}
              </div>
            </AnimatedCard>

            {/* Entry Cards */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {d.entries.map((entry, i) => {
                const cardDelay = phase3Start + i * 0.4
                return (
                  <div
                    key={i}
                    style={{
                      backgroundColor: C.card,
                      border: `1px solid ${C.lineSoft}`,
                      borderRadius: 14,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      opacity: fadeIn(frame, fps, cardDelay, 0.4),
                      transform: `translateY(${interpolate(fadeIn(frame, fps, cardDelay, 0.4), [0, 1], [12, 0])}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 32,
                        borderRadius: 3,
                        backgroundColor: statusColor(entry.status),
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{entry.title}</div>
                      <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>{entry.subtitle}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {entry.tags.map((tag, j) => (
                        <span
                          key={j}
                          style={{
                            fontSize: 9,
                            padding: '2px 6px',
                            borderRadius: 6,
                            backgroundColor: C.paper2,
                            color: C.ink2,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: `${statusColor(entry.status)}15`,
                        color: statusColor(entry.status),
                      }}
                    >
                      {entry.status}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: AI Suggestions */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* AI Suggestion Card */}
            <AnimatedCard delay={phase4Start}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                >
                  🤖
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>AI 建议</span>
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 8,
                    backgroundColor: `${C.chestnut}12`,
                    color: C.chestnut,
                    fontWeight: 600,
                  }}
                >
                  基于你的数据
                </span>
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: C.ink,
                  fontFamily: FONT.sans,
                  padding: 16,
                  backgroundColor: C.paper2,
                  borderRadius: 12,
                  border: `1px solid ${C.lineSoft}`,
                }}
              >
                <TypewriterLine text={d.aiSuggestion} delay={phase4Start + 0.5} speed={2} />
              </div>
            </AnimatedCard>

            {/* Kanban Preview */}
            <AnimatedCard delay={phase4Start + 2}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 12, letterSpacing: 1 }}>
                看板视图
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {['待开始', '进行中', '已完成'].map((col, ci) => (
                  <div key={ci}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: ci === 0 ? C.accent : ci === 1 ? C.blue : C.zoneSafe,
                        marginBottom: 8,
                        textAlign: 'center',
                      }}
                    >
                      {col}
                    </div>
                    {[0, 1].map((ri) => {
                      const anim = fadeIn(frame, fps, phase4Start + 2.5 + ci * 0.3 + ri * 0.15, 0.3)
                      return (
                        <div
                          key={ri}
                          style={{
                            backgroundColor: C.paper2,
                            border: `1px solid ${C.lineSoft}`,
                            borderRadius: 8,
                            padding: '8px 10px',
                            marginBottom: 4,
                            fontSize: 11,
                            color: C.ink,
                            opacity: anim,
                          }}
                        >
                          {ci === 0 ? '学习 WebGL' : ci === 1 ? '重构白板组件' : '性能优化报告'}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </AnimatedCard>

            {/* Plan Preview */}
            <AnimatedCard delay={phase4Start + 3.5}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>
                本周计划
              </div>
              {['完成系统设计专题学习', '模拟面试 ×2（前端方向）'].map((plan, i) => {
                const anim = slideUp(frame, fps, phase4Start + 4 + i * 0.3, 0.3, 8)
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      backgroundColor: C.paper2,
                      borderRadius: 10,
                      marginBottom: 4,
                      opacity: anim.opacity,
                      transform: `translateY(${anim.translateY}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: `2px solid ${C.chestnut}`,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, color: C.ink }}>{plan}</span>
                  </div>
                )
              })}
            </AnimatedCard>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const TypewriterLine: React.FC<{ text: string; delay: number; speed: number }> = ({ text, delay, speed }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = delayFrame(frame, delay, fps)
  const charCount = Math.min(text.length, Math.floor(f / speed))
  return (
    <>
      {text.slice(0, charCount)}
      {charCount < text.length && <span style={{ borderRight: `2px solid ${C.chestnut}`, marginLeft: 1 }}> </span>}
    </>
  )
}

export default GrowthDemoScene
