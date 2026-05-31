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
