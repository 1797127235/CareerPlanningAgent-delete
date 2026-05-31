import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from 'remotion'
import { C, FONT } from '../tokens'
import { GRAPH_JD_DATA } from '../content'
import { MiniNavbar, RadarChart } from '../components/UIPrimitives'
import { SpringFadeIn, SpringScaleIn, StaggerSpring, SPRING_BOUNCE, SPRING_POP, SPRING_SOFT, getSpringProgress } from '../components/Animations'

const GraphJDScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = GRAPH_JD_DATA

  const phase1End = 8 * fps
  const phase2End = 18 * fps

  const isPhase1 = frame < phase1End
  const isPhase2 = frame >= phase1End && frame < phase2End
  const isPhase3 = frame >= phase2End

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar activeLabel="职位地图" />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <SpringFadeIn delay={0.2} duration={0.5} direction="up" distance={10} springConfig={SPRING_SOFT}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, letterSpacing: 1, marginBottom: 16 }}>
            02 · 岗位图谱
          </div>
        </SpringFadeIn>

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Phase 1: Positioning (0-8s) */}
          <Phase1Nodes d={d} frame={frame} fps={fps} visible={isPhase1 || frame < phase1End + 2 * fps} />

          {/* Phase 2: Diagnosis (8-18s) */}
          {isPhase2 && <Phase2Diagnosis d={d} frame={frame} fps={fps} phase1End={phase1End} />}

          {/* Phase 3: Path (18-25s) */}
          {isPhase3 && <Phase3Path d={d} frame={frame} fps={fps} phase2End={phase2End} />}
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ─── Phase 1: 45 Nodes Grid ───
const Phase1Nodes: React.FC<{ d: typeof GRAPH_JD_DATA; frame: number; fps: number; visible: boolean }> = ({ d, frame, fps, visible }) => {
  const targetIds = new Set(d.targetPath.map(r => r.id))

  // 6 columns × 8 rows grid
  const cols = 6
  const rows = 8
  const gridGap = 12
  const nodeSize = 48

  const highlightProgress = getSpringProgress(frame, fps, 2.5, 3, SPRING_SOFT)

  const containerOpacity = visible
    ? frame > 10 * fps ? interpolate(frame, [10 * fps, 10.5 * fps], [1, 0.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1
    : 0.15

  const containerScale = frame > 10 * fps
    ? interpolate(frame, [10 * fps, 10.5 * fps], [1, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: containerOpacity,
      transform: `scale(${containerScale})`,
      transition: 'none',
    }}>
      {/* Grid of nodes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${nodeSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${nodeSize}px)`,
        gap: `${gridGap}px`,
        position: 'relative',
      }}>
        {d.roles.slice(0, cols * rows).map((role, i) => {
          const isTarget = targetIds.has(role.id)
          const row = Math.floor(i / cols)
          const col = i % cols
          const delay = (row + col) * 0.03

          return (
            <SpringScaleIn key={role.id} delay={delay} duration={1.5} from={0} springConfig={SPRING_POP}>
              <div style={{
                width: nodeSize,
                height: nodeSize,
                borderRadius: '50%',
                backgroundColor: isTarget
                  ? (highlightProgress > 0.5 ? C.chestnut : C.line)
                  : C.lineSoft,
                opacity: isTarget ? 1 : 0.5 + highlightProgress * 0.3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: isTarget ? 700 : 500,
                color: isTarget ? C.white : C.ink2,
                boxShadow: isTarget ? `0 0 ${12 + highlightProgress * 8}px ${C.chestnut}60` : 'none',
                transform: `scale(${isTarget ? 1 + highlightProgress * 0.2 : 1})`,
              }}>
                {role.label.slice(0, 2)}
              </div>
            </SpringScaleIn>
          )
        })}
      </div>

      {/* Connecting lines for target path */}
      {frame > 5 * fps && (
        <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: cols * (nodeSize + gridGap), height: rows * (nodeSize + gridGap), pointerEvents: 'none' }}>
          {d.targetPath.slice(0, -1).map((_, i) => {
            const fromRole = d.targetPath[i]
            const toRole = d.targetPath[i + 1]
            const fromIdx = d.roles.findIndex(r => r.id === fromRole.id)
            const toIdx = d.roles.findIndex(r => r.id === toRole.id)
            if (fromIdx === -1 || toIdx === -1) return null

            const fromRow = Math.floor(fromIdx / cols)
            const fromCol = fromIdx % cols
            const toRow = Math.floor(toIdx / cols)
            const toCol = toIdx % cols

            const x1 = fromCol * (nodeSize + gridGap) + nodeSize / 2
            const y1 = fromRow * (nodeSize + gridGap) + nodeSize / 2
            const x2 = toCol * (nodeSize + gridGap) + nodeSize / 2
            const y2 = toRow * (nodeSize + gridGap) + nodeSize / 2

            const lineProgress = getSpringProgress(frame, fps, 5 + i * 0.5, 2, SPRING_SOFT)

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x1 + (x2 - x1) * lineProgress}
                y2={y1 + (y2 - y1) * lineProgress}
                stroke={C.chestnut}
                strokeWidth={2}
                opacity={lineProgress}
                strokeDasharray="4 4"
              />
            )
          })}
        </svg>
      )}

      {/* Bottom caption */}
      <SpringFadeIn delay={6} duration={1} direction="up" distance={20} springConfig={SPRING_SOFT}>
        <div style={{
          position: 'absolute',
          bottom: 40,
          fontSize: 16,
          color: C.ink2,
          textAlign: 'center',
          fontWeight: 500,
        }}>
          在 45 个 IT 岗位中，系统定位了你的职业坐标
        </div>
      </SpringFadeIn>
    </div>
  )
}

// ─── Phase 2: Diagnosis ───
const Phase2Diagnosis: React.FC<{ d: typeof GRAPH_JD_DATA; frame: number; fps: number; phase1End: number }> = ({ d, frame, fps, phase1End }) => {
  const localFrame = frame - phase1End

  // Radar chart data
  const requirementAxes = d.radarAxes.map((a, i) => ({ ...a, value: a.value }))
  const userAxes = d.radarAxes.map((a, i) => ({ ...a, value: d.userRadarScores[i] }))

  const radarVisible = getSpringProgress(localFrame, fps, 0, 2, SPRING_SOFT)
  const scoreVisible = getSpringProgress(localFrame, fps, 4, 2, SPRING_BOUNCE)

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: 32, alignItems: 'center' }}>
      {/* Left: Requirement Radar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: radarVisible, transform: `scale(${0.8 + 0.2 * radarVisible})` }}>
        <SpringFadeIn delay={0.2} duration={1} springConfig={SPRING_SOFT}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 16, letterSpacing: 1 }}>
            岗位要求
          </div>
        </SpringFadeIn>
        <RadarChart axes={requirementAxes} size={200} delay={0.5} />
      </div>

      {/* Center: Match Score */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <SpringScaleIn delay={3.5} duration={1.5} from={0.5} springConfig={SPRING_BOUNCE}>
          <div style={{
            fontSize: 80,
            fontWeight: 900,
            color: C.chestnut,
            fontFamily: FONT.sans,
            lineHeight: 1,
          }}>
            {Math.round(scoreVisible * d.matchScore)}%
          </div>
        </SpringScaleIn>
        <SpringFadeIn delay={5} duration={0.8} springConfig={SPRING_POP}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>
            {d.matchLabel}
          </div>
        </SpringFadeIn>
        <SpringFadeIn delay={5.5} duration={0.8} springConfig={SPRING_POP}>
          <div style={{ fontSize: 14, color: C.accent, fontWeight: 700 }}>
            {d.gapCount} 项核心能力存在差距
          </div>
        </SpringFadeIn>
      </div>

      {/* Right: User Radar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: radarVisible, transform: `scale(${0.8 + 0.2 * radarVisible})` }}>
        <SpringFadeIn delay={0.4} duration={1} springConfig={SPRING_SOFT}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 16, letterSpacing: 1 }}>
            当前能力
          </div>
        </SpringFadeIn>
        <RadarChart axes={userAxes} size={200} delay={0.7} accentColor={C.accent} />
      </div>
    </div>
  )
}

// ─── Phase 3: Path ───
const Phase3Path: React.FC<{ d: typeof GRAPH_JD_DATA; frame: number; fps: number; phase2End: number }> = ({ d, frame, fps, phase2End }) => {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <SpringFadeIn delay={0.2} duration={0.6} springConfig={SPRING_SOFT}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink2, letterSpacing: 1, marginBottom: 8 }}>
          系统已生成专属成长路径
        </div>
      </SpringFadeIn>

      <StaggerSpring baseDelay={0.5} staggerFrames={8} duration={0.8} direction="up" distance={30} springConfig={SPRING_POP}>
        {d.gapItems.map((item, i) => (
          <GapCard key={i} item={item} index={i} />
        ))}
      </StaggerSpring>

      <SpringScaleIn delay={3.5} duration={1.5} from={0.8} springConfig={SPRING_BOUNCE}>
        <div style={{
          marginTop: 16,
          padding: '16px 40px',
          backgroundColor: `${C.chestnut}10`,
          borderRadius: 12,
          border: `2px solid ${C.chestnut}30`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: C.ink2, marginBottom: 4 }}>预计学习时间</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.chestnut, fontFamily: FONT.sans }}>
            {d.totalHours} 小时
          </div>
        </div>
      </SpringScaleIn>
    </div>
  )
}

const GapCard: React.FC<{ item: typeof GRAPH_JD_DATA.gapItems[0]; index: number }> = ({ item, index }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const barProgress = getSpringProgress(frame, fps, 1.5 + index * 0.3, 1.5, SPRING_POP)

  return (
    <div style={{
      width: 480,
      backgroundColor: C.card,
      border: `1px solid ${C.lineSoft}`,
      borderRadius: 16,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{ width: 100, fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: FONT.sans }}>
        {item.skill}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.ink2, marginBottom: 6 }}>
          <span>当前 {item.current}%</span>
          <span>目标 {item.target}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, backgroundColor: C.line, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${item.current}%`,
            borderRadius: 4,
            backgroundColor: C.lineSoft,
          }} />
          <div style={{
            width: `${item.current + (item.target - item.current) * barProgress}%`,
            height: '100%',
            borderRadius: 4,
            backgroundColor: C.chestnut,
            opacity: barProgress,
          }} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: C.inkMuted, width: 60, textAlign: 'right' }}>
        {item.hours}h
      </div>
    </div>
  )
}

export default GraphJDScene
