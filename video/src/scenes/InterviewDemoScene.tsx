import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, Easing } from 'remotion'
import { C, FONT } from '../tokens'
import { INTERVIEW_DATA } from '../content'
import { ScoreRing, SceneHeader, AnimatedCard, MiniNavbar, fadeIn, slideUp, delayFrame } from '../components/UIPrimitives'

const TrackIcon: React.FC<{ name: string }> = ({ name }) => {
  const icons: Record<string, string> = {
    Monitor: '🖥',
    Server: '🖥',
    Cpu: '⚙',
    BarChart3: '📊',
    ShieldCheck: '🛡',
    Bot: '🤖',
  }
  return <span style={{ fontSize: 18 }}>{icons[name] ?? '●'}</span>
}

const InterviewDemoScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = INTERVIEW_DATA

  const phase2Start = 3
  const phase3Start = 7

  const trackSelectProgress = interpolate(frame, [0.5 * fps, 1.5 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })
  const selectedTrackIdx = Math.min(
    d.tracks.length - 1,
    Math.floor(trackSelectProgress * d.tracks.length)
  )

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <SceneHeader index={4} title="面试教练" desc="6 技术方向 · AI 评分 · 详细反馈" delay={0} />

        <div style={{ flex: 1, display: 'flex', gap: 32 }}>
          {/* Left Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Track Selection */}
            <AnimatedCard delay={0.2}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 12, letterSpacing: 1 }}>
                选择方向
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {d.tracks.map((track, i) => {
                  const isSelected = i === selectedTrackIdx
                  const anim = fadeIn(frame, fps, 0.4 + i * 0.1, 0.3)
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 12,
                        textAlign: 'center',
                        opacity: anim,
                        backgroundColor: isSelected ? `${C.chestnut}12` : C.paper2,
                        border: `1.5px solid ${isSelected ? C.chestnut : C.lineSoft}`,
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      <TrackIcon name={track.icon} />
                      <div style={{ fontSize: 11, fontWeight: isSelected ? 700 : 500, color: isSelected ? C.chestnut : C.ink2, marginTop: 4 }}>
                        {track.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </AnimatedCard>

            {/* Question */}
            <AnimatedCard delay={phase2Start}>
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
                <span style={{ fontSize: 12, fontWeight: 600, color: C.ink2 }}>AI 面试官</span>
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.ink,
                  lineHeight: 1.6,
                  fontFamily: FONT.sans,
                  padding: 16,
                  backgroundColor: C.paper2,
                  borderRadius: 12,
                  border: `1px solid ${C.lineSoft}`,
                }}
              >
                {d.question}
              </div>
            </AnimatedCard>

            {/* Answer */}
            <AnimatedCard delay={phase2Start + 1.5}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: C.blue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.white,
                  }}
                >
                  你
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.ink2 }}>你的回答</span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: C.ink,
                  lineHeight: 1.7,
                  fontFamily: FONT.sans,
                  padding: 14,
                  backgroundColor: `${C.blueSoft}40`,
                  borderRadius: 12,
                  border: `1px solid ${C.blueSoft}`,
                }}
              >
                <TypewriterContent text={d.answer} delay={phase2Start + 2} speed={2} />
              </div>
            </AnimatedCard>
          </div>

          {/* Right Column: Results */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Score Ring */}
            <AnimatedCard delay={phase3Start} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <ScoreRing score={d.overallScore} size={130} delay={phase3Start + 0.5} label="综合评分" />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>AI 评分完成</div>
                <div style={{ fontSize: 13, color: C.inkMuted, marginTop: 4, lineHeight: 1.6 }}>
                  基于内容准确性、深度、结构化表达三个维度综合评估
                </div>
              </div>
            </AnimatedCard>

            {/* Per-question scores */}
            <AnimatedCard delay={phase3Start + 1}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 12, letterSpacing: 1 }}>
                逐题评分
              </div>
              {d.perQuestion.map((q, i) => {
                const anim = slideUp(frame, fps, phase3Start + 1.3 + i * 0.4, 0.4, 12)
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: C.paper2,
                      borderRadius: 10,
                      marginBottom: 6,
                      opacity: anim.opacity,
                      transform: `translateY(${anim.translateY}px)`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{q.question}</div>
                      <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>{q.feedback}</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.chestnut }}>{q.score}</div>
                  </div>
                )
              })}
            </AnimatedCard>

            {/* Strengths & Improvements */}
            <AnimatedCard delay={phase3Start + 2.5}>
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.zoneSafe, marginBottom: 6, letterSpacing: 1 }}>
                    ✓ 亮点
                  </div>
                  {d.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: 12, color: C.ink, marginBottom: 3, opacity: fadeIn(frame, fps, phase3Start + 3 + i * 0.2) }}>
                      {s}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#E65100', marginBottom: 6, letterSpacing: 1 }}>
                    △ 改进建议
                  </div>
                  {d.improvements.map((imp, i) => (
                    <div key={i} style={{ fontSize: 12, color: C.ink, marginBottom: 3, opacity: fadeIn(frame, fps, phase3Start + 3.2 + i * 0.2) }}>
                      {imp}
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const TypewriterContent: React.FC<{ text: string; delay: number; speed: number }> = ({ text, delay, speed }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = delayFrame(frame, delay, fps)
  const charCount = Math.min(text.length, Math.floor(f / speed))
  return <>{text.slice(0, charCount)}{charCount < text.length && <span style={{ borderRight: `2px solid ${C.blue}`, marginLeft: 1 }}> </span>}</>
}

export default InterviewDemoScene
