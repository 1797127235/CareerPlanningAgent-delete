import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, Easing } from 'remotion'
import { C, FONT } from '../tokens'
import { GRAPH_DATA } from '../content'
import { RadarChart, SceneHeader, SkillChip, MiniNavbar, fadeIn } from '../components/UIPrimitives'

const zoneColor = (zone: string) =>
  zone === 'safe' ? C.zoneSafe : zone === 'leverage' ? C.zoneLeverage : zone === 'transition' ? C.zoneTransition : C.zoneDanger

const zoneLabel = (zone: string) =>
  zone === 'safe' ? '安全区' : zone === 'leverage' ? '协同优势' : zone === 'transition' ? '转型过渡' : '替代警惕'

const RoleCard: React.FC<{
  label: string
  family: string
  zone: string
  salary: string
  skills: string[]
  aiLeverage: number
  isCenter?: boolean
  offsetX?: number
  scale?: number
  opacity?: number
  delay?: number
}> = ({ label, family, zone, salary, skills, aiLeverage, isCenter, offsetX = 0, scale = 1, opacity = 1, delay = 0 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const anim = fadeIn(frame, fps, delay, 0.5)
  const w = 220
  const h = 280

  return (
    <div
      style={{
        width: w,
        height: h,
        backgroundColor: C.card,
        border: `1.5px solid ${isCenter ? C.chestnut : C.lineSoft}`,
        borderRadius: 20,
        padding: 20,
        opacity: Math.min(opacity, anim),
        transform: `translateX(${offsetX}px) scale(${scale})`,
        boxShadow: isCenter ? `0 8px 32px ${C.chestnut}20` : '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: zoneColor(zone),
          backgroundColor: `${zoneColor(zone)}15`,
          padding: '3px 10px',
          borderRadius: 8,
          alignSelf: 'flex-start',
          marginBottom: 10,
        }}
      >
        {zoneLabel(zone)}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, fontFamily: FONT.sans, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: C.inkMuted, fontFamily: FONT.sans, marginBottom: 12 }}>
        {family}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: C.chestnut, fontFamily: FONT.sans, marginBottom: 8 }}>
        {salary}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 'auto' }}>
        {skills.map((s, i) => (
          <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, backgroundColor: C.paper2, color: C.ink2 }}>
            {s}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.inkMuted, marginBottom: 3 }}>
          <span>AI 协同度</span>
          <span>{Math.round(aiLeverage * 100)}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, backgroundColor: C.line, overflow: 'hidden' }}>
          <div style={{ width: `${aiLeverage * 100}%`, height: '100%', borderRadius: 2, backgroundColor: zoneColor(zone) }} />
        </div>
      </div>
    </div>
  )
}

const GraphDemoScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const roles = GRAPH_DATA.roles

  const coverflowProgress = interpolate(frame, [1 * fps, 4 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })

  const centerIdx = Math.round(coverflowProgress * (roles.length - 1))

  const radarVisible = fadeIn(frame, fps, 5, 0.6)
  const pathVisible = fadeIn(frame, fps, 7, 0.6)

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar activeLabel="职位地图" />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <SceneHeader index={2} title="岗位图谱" desc="45 个真实 IT 岗位 · AI 影响分析 · 转型路径" delay={0} />

        <div style={{ flex: 1, display: 'flex', gap: 32 }}>
          {/* Coverflow */}
          <div style={{ flex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {roles.map((role, i) => {
              const dist = i - centerIdx
              const absDist = Math.abs(dist)
              const cardOpacity = absDist > 2 ? 0 : absDist === 0 ? 1 : 0.5
              const cardScale = absDist === 0 ? 1.05 : 0.85
              const cardOffsetX = dist * 100

              return (
                <div key={i} style={{ position: 'absolute', left: '50%', marginLeft: -110 + cardOffsetX }}>
                  <RoleCard
                    label={role.label}
                    family={role.family}
                    zone={role.zone}
                    salary={role.salary}
                    skills={role.skills}
                    aiLeverage={role.aiLeverage}
                    isCenter={absDist === 0}
                    offsetX={0}
                    scale={cardScale}
                    opacity={cardOpacity}
                    delay={0.3}
                  />
                </div>
              )
            })}
          </div>

          {/* Right Panel: Radar + Transition Path */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
            {/* Radar Chart */}
            <AnimatedPanel opacity={radarVisible}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 12, letterSpacing: 1 }}>
                岗位能力雷达
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <RadarChart axes={GRAPH_DATA.radarAxes} size={200} delay={5.2} />
              </div>
            </AnimatedPanel>

            {/* Transition Path */}
            <AnimatedPanel opacity={pathVisible}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 12, letterSpacing: 1 }}>
                转型路径
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ padding: '6px 14px', borderRadius: 10, backgroundColor: C.paper2, fontSize: 13, fontWeight: 600, color: C.ink }}>
                  {GRAPH_DATA.transitionPath.from}
                </div>
                <div style={{ fontSize: 18, color: C.chestnut }}>→</div>
                <div style={{ padding: '6px 14px', borderRadius: 10, backgroundColor: `${C.chestnut}12`, border: `1px solid ${C.chestnut}30`, fontSize: 13, fontWeight: 700, color: C.chestnut }}>
                  {GRAPH_DATA.transitionPath.to}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {GRAPH_DATA.transitionPath.gapSkills.map((skill, i) => (
                  <SkillChip key={i} label={skill} type="gap" delay={7.5 + i * 0.2} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: C.inkMuted }}>
                预计学习 {GRAPH_DATA.transitionPath.hours} 小时
              </div>
            </AnimatedPanel>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const AnimatedPanel: React.FC<{ children: React.ReactNode; opacity: number }> = ({ children, opacity }) => (
  <div
    style={{
      backgroundColor: C.card,
      border: `1px solid ${C.lineSoft}`,
      borderRadius: 16,
      padding: 20,
      opacity,
    }}
  >
    {children}
  </div>
)

export default GraphDemoScene
