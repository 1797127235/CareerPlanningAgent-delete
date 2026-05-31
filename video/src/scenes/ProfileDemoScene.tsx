import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion'
import { C, FONT } from '../tokens'
import { PROFILE_DATA } from '../content'
import { ScoreBar, SkillChip, AnimatedCard, SceneHeader, MiniCard, MiniNavbar, fadeIn, slideUp } from '../components/UIPrimitives'

const ProfileDemoScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar activeLabel="能力画像" />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <SceneHeader index={1} title="能力画像" desc="简历解析 → 技能提取 → 职业定位" delay={0} />

        <div style={{ flex: 1, display: 'flex', gap: 32 }}>
          {/* Left Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Identity Card */}
            <AnimatedCard delay={0.3}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, fontFamily: FONT.sans }}>
                    {PROFILE_DATA.name}
                  </div>
                  <div style={{ fontSize: 14, color: C.chestnut, fontFamily: FONT.sans, marginTop: 4 }}>
                    目标：{PROFILE_DATA.target}
                  </div>
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: `linear-gradient(135deg, ${C.chestnut}, ${C.accent})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: C.white,
                    fontWeight: 700,
                  }}
                >
                  林
                </div>
              </div>
            </AnimatedCard>

            {/* Dimension Scores */}
            <AnimatedCard delay={0.8}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 12, letterSpacing: 1 }}>
                能力维度
              </div>
              {PROFILE_DATA.dimensionScores.map((dim, i) => (
                <ScoreBar key={i} label={dim.name} score={dim.score} delay={1 + i * 0.3} />
              ))}
            </AnimatedCard>

            {/* Strengths & Weaknesses */}
            <AnimatedCard delay={2.5}>
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.success, marginBottom: 8, letterSpacing: 1 }}>
                    优势
                  </div>
                  {PROFILE_DATA.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: 13, color: C.ink, marginBottom: 4, opacity: fadeIn(frame, fps, 2.8 + i * 0.2, 0.3) }}>
                      ✓ {s}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 8, letterSpacing: 1 }}>
                    待提升
                  </div>
                  {PROFILE_DATA.weaknesses.map((w, i) => (
                    <div key={i} style={{ fontSize: 13, color: C.ink, marginBottom: 4, opacity: fadeIn(frame, fps, 3 + i * 0.2, 0.3) }}>
                      ○ {w}
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Right Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Skills */}
            <AnimatedCard delay={1.5}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>
                技能标签
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {PROFILE_DATA.skills.map((skill, i) => (
                  <SkillChip key={i} label={`${skill.name} · ${skill.level}`} type="neutral" delay={1.8 + i * 0.15} />
                ))}
              </div>
            </AnimatedCard>

            {/* Recommendations */}
            <AnimatedCard delay={3.5}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>
                推荐方向
              </div>
              {PROFILE_DATA.recommendations.map((rec, i) => {
                const anim = slideUp(frame, fps, 3.8 + i * 0.3, 0.4, 12)
                const zoneColor = rec.zone === 'leverage' ? C.zoneLeverage : rec.zone === 'safe' ? C.zoneSafe : C.zoneTransition
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: C.paper2,
                      borderRadius: 10,
                      marginBottom: 6,
                      opacity: anim.opacity,
                      transform: `translateY(${anim.translateY}px)`,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: FONT.sans }}>
                      {rec.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: zoneColor, fontWeight: 700 }}>{rec.zone}</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: C.chestnut }}>{rec.match}%</span>
                    </div>
                  </div>
                )
              })}
            </AnimatedCard>

            {/* Experience Timeline */}
            <AnimatedCard delay={4.5}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>
                经历
              </div>
              {PROFILE_DATA.internships.map((exp, i) => (
                <MiniCard key={i} title={exp.company} subtitle={`${exp.role} · ${exp.period}`} delay={4.8 + i * 0.3} accent={C.chestnut} />
              ))}
              {PROFILE_DATA.projects.map((proj, i) => (
                <div key={i} style={{ marginTop: 4 }}>
                  <MiniCard title={proj.name} subtitle={proj.tech} delay={5.4 + i * 0.3} />
                </div>
              ))}
            </AnimatedCard>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

export default ProfileDemoScene
