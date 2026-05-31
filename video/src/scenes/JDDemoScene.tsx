import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion'
import { C, FONT } from '../tokens'
import { JD_DATA } from '../content'
import { SkillChip, ScoreRing, SceneHeader, AnimatedCard, MiniNavbar, slideUp, delayFrame } from '../components/UIPrimitives'

const TypewriterText: React.FC<{ text: string; delay: number; speed?: number }> = ({ text, delay, speed = 3 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = delayFrame(frame, delay, fps)
  const charCount = Math.min(text.length, Math.floor(f / speed))
  const visible = text.slice(0, charCount)

  return (
    <div
      style={{
        fontSize: 13,
        color: C.ink,
        fontFamily: FONT.sans,
        lineHeight: 1.7,
        padding: 16,
        backgroundColor: C.paper2,
        borderRadius: 12,
        border: `1px solid ${C.lineSoft}`,
        minHeight: 80,
        maxHeight: 100,
        overflow: 'hidden',
      }}
    >
      {visible}
      {charCount < text.length && (
        <span style={{ borderRight: `2px solid ${C.chestnut}`, marginLeft: 1 }}> </span>
      )}
    </div>
  )
}

const JDDemoScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = JD_DATA

  const phase2Start = 2.5
  const phase3Start = 5
  const phase4Start = 7

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <SceneHeader index={3} title="JD 诊断" desc="粘贴 JD → 四维匹配 → 差距分析 → 补强计划" delay={0} />

        <div style={{ flex: 1, display: 'flex', gap: 32 }}>
          {/* Left: JD Input + Score */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* JD Input Area */}
            <AnimatedCard delay={0.3}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, letterSpacing: 1 }}>
                  岗位描述
                </div>
                <div
                  style={{
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 8,
                    backgroundColor: `${C.chestnut}12`,
                    color: C.chestnut,
                    fontWeight: 600,
                  }}
                >
                  示例 JD
                </div>
              </div>
              <TypewriterText text={d.sampleText} delay={0.5} speed={2.5} />
            </AnimatedCard>

            {/* Match Score */}
            <AnimatedCard delay={phase2Start}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <ScoreRing score={d.matchScore} size={120} delay={phase2Start + 0.3} label="匹配度" />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, fontFamily: FONT.sans }}>
                    {d.matchLabel}
                  </div>
                  <div style={{ fontSize: 12, color: C.inkMuted, fontFamily: FONT.sans, marginTop: 4 }}>
                    综合评估你的技能与岗位需求匹配程度
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 8,
                      backgroundColor: `${C.zoneTransition}15`,
                      border: `1px solid ${C.zoneTransition}40`,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.zoneTransition,
                    }}
                  >
                    {d.zone.label}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Right: Dimensions + Skills */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Four Dimensions */}
            <AnimatedCard delay={phase3Start}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 14, letterSpacing: 1 }}>
                四维评估
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {d.dimensions.map((dim, i) => {
                  const anim = slideUp(frame, fps, phase3Start + 0.3 + i * 0.2, 0.4, 12)
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: C.paper2,
                        borderRadius: 12,
                        opacity: anim.opacity,
                        transform: `translateY(${anim.translateY}px)`,
                      }}
                    >
                      <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>{dim.label}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: C.chestnut, fontFamily: FONT.sans }}>
                          {dim.score}
                        </span>
                        <span style={{ fontSize: 12, color: C.inkMuted }}>/100</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </AnimatedCard>

            {/* Matched & Gap Skills */}
            <AnimatedCard delay={phase4Start}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.zoneSafe, marginBottom: 8, letterSpacing: 1 }}>
                  ✓ 已匹配技能
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {d.matchedSkills.map((skill, i) => (
                    <SkillChip key={i} label={skill} type="match" delay={phase4Start + 0.3 + i * 0.12} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#E65100', marginBottom: 8, letterSpacing: 1 }}>
                  ✗ 技能缺口
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {d.gapSkills.map((skill, i) => (
                    <SkillChip key={i} label={skill} type="gap" delay={phase4Start + 0.8 + i * 0.12} />
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

export default JDDemoScene
