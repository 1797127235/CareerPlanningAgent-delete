import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'
import { C, FONT } from '../tokens'

export const MiniNavbar: React.FC<{ activeLabel?: string }> = ({ activeLabel }) => {
  const links = ['能力画像', '成长手札', '职位地图', '职业报告']
  return (
    <div
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 60px',
        borderBottom: `1px solid ${C.line}`,
        backgroundColor: C.bg,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 17, fontWeight: 700, color: C.ink, fontFamily: FONT.sans, letterSpacing: -0.3 }}>
        CareerOS
      </span>
      <div style={{ display: 'flex', gap: 32 }}>
        {links.map((label) => (
          <span
            key={label}
            style={{
              fontSize: 14,
              fontWeight: label === activeLabel ? 700 : 500,
              color: label === activeLabel ? C.chestnut : C.ink2,
              fontFamily: FONT.sans,
              position: 'relative',
            }}
          >
            {label}
            {label === activeLabel && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -22,
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: C.chestnut,
                  borderRadius: 1,
                }}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export const delayFrame = (frame: number, delay: number, fps: number) =>
  Math.max(0, frame - delay * fps)

export const fadeIn = (frame: number, fps: number, delay = 0, dur = 0.5) => {
  const f = delayFrame(frame, delay, fps)
  return interpolate(f, [0, dur * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })
}

export const slideUp = (frame: number, fps: number, delay = 0, dur = 0.5, dist = 20) => {
  const f = delayFrame(frame, delay, fps)
  const t = interpolate(f, [0, dur * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })
  return { opacity: t, translateY: dist * (1 - t) }
}

export const ScoreBar: React.FC<{
  label: string
  score: number
  maxScore?: number
  delay?: number
  color?: string
  width?: number
}> = ({ label, score, maxScore = 100, delay = 0, color, width = 280 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = delayFrame(frame, delay, fps)
  const pct = interpolate(f, [0, 0.8 * fps], [0, score / maxScore], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })
  const barColor = color ?? (score >= 80 ? C.chestnut : score >= 60 ? C.chestnutLight : C.accent)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: C.ink2, fontFamily: FONT.sans, width: 80, textAlign: 'right' }}>
        {label}
      </span>
      <div style={{ width, height: 8, borderRadius: 4, backgroundColor: C.line, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 4, backgroundColor: barColor }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, fontFamily: FONT.sans, width: 32 }}>
        {Math.round(pct * maxScore)}
      </span>
    </div>
  )
}

export const SkillChip: React.FC<{
  label: string
  type?: 'match' | 'gap' | 'neutral'
  delay?: number
}> = ({ label, type = 'neutral', delay = 0 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fadeIn(frame, fps, delay, 0.3)
  const scale = interpolate(opacity, [0, 1], [0.8, 1])

  const bg = type === 'match' ? '#E8F5E9' : type === 'gap' ? '#FFF3E0' : C.paper2
  const border = type === 'match' ? '#A5D6A7' : type === 'gap' ? '#FFCC80' : C.lineSoft
  const color = type === 'match' ? '#2E7D32' : type === 'gap' ? '#E65100' : C.ink2

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 16,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: FONT.sans,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color,
        opacity,
        transform: `scale(${scale})`,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      {label}
    </span>
  )
}

export const AnimatedCard: React.FC<{
  children: React.ReactNode
  delay?: number
  width?: number | string
  height?: number | string
  style?: React.CSSProperties
}> = ({ children, delay = 0, width, height, style }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const anim = slideUp(frame, fps, delay, 0.5, 16)

  return (
    <div
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.lineSoft}`,
        borderRadius: 16,
        padding: 20,
        width,
        height,
        opacity: anim.opacity,
        transform: `translateY(${anim.translateY}px)`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export const RadarChart: React.FC<{
  axes: { label: string; value: number }[]
  size?: number
  delay?: number
  accentColor?: string
}> = ({ axes, size = 180, delay = 0, accentColor }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = delayFrame(frame, delay, fps)
  const progress = interpolate(f, [0, 1 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 24
  const n = axes.length
  const angleStep = (2 * Math.PI) / n
  const color = accentColor ?? C.chestnut

  const getPoint = (i: number, val: number) => {
    const angle = -Math.PI / 2 + i * angleStep
    const dist = r * val * progress
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  const dataPoints = axes.map((a, i) => getPoint(i, a.value))
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((level, li) => (
        <polygon
          key={li}
          points={axes.map((_, i) => getPoint(i, level)).map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={C.line}
          strokeWidth={0.5}
        />
      ))}
      {axes.map((_, i) => {
        const outer = getPoint(i, 1)
        return (
          <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke={C.line} strokeWidth={0.5} />
        )
      })}
      <polygon points={polygon} fill={`${color}22`} stroke={color} strokeWidth={2} />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
      {axes.map((a, i) => {
        const label = getPoint(i, 1.18)
        return (
          <text
            key={i}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontFamily={FONT.sans}
            fill={C.ink2}
          >
            {a.label}
          </text>
        )
      })}
    </svg>
  )
}

export const ScoreRing: React.FC<{
  score: number
  size?: number
  delay?: number
  label?: string
}> = ({ score, size = 100, delay = 0, label }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = delayFrame(frame, delay, fps)
  const progress = interpolate(f, [0, 1.2 * fps], [0, score / 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 8
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - progress)
  const color = score >= 80 ? C.chestnut : score >= 60 ? C.chestnutLight : C.accent

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.line} strokeWidth={6} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: size * 0.28, fontWeight: 800, color: C.ink, fontFamily: FONT.sans }}>
          {Math.round(progress * score)}
        </span>
        {label && (
          <span style={{ fontSize: 10, color: C.inkMuted, fontFamily: FONT.sans, marginTop: 2 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

export const SceneHeader: React.FC<{
  index: number
  title: string
  desc: string
  delay?: number
}> = ({ index, title, desc, delay = 0 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fadeIn(frame, fps, delay, 0.6)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity, marginBottom: 24 }}>
      <div
        style={{
          fontSize: 14,
          color: C.chestnut,
          fontWeight: 700,
          letterSpacing: 2,
          fontFamily: FONT.sans,
        }}
      >
        0{index}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, fontFamily: FONT.sans }}>
        {title}
      </div>
      <div style={{ fontSize: 15, color: C.ink2, marginLeft: 8, fontFamily: FONT.sans }}>
        {desc}
      </div>
    </div>
  )
}

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

export const MiniCard: React.FC<{
  title: string
  subtitle?: string
  tags?: string[]
  delay?: number
  accent?: string
}> = ({ title, subtitle, tags, delay = 0, accent }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const anim = slideUp(frame, fps, delay, 0.4, 12)

  return (
    <div
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.lineSoft}`,
        borderRadius: 12,
        padding: '14px 16px',
        opacity: anim.opacity,
        transform: `translateY(${anim.translateY}px)`,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: accent ?? C.ink, fontFamily: FONT.sans }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 4, fontFamily: FONT.sans }}>
          {subtitle}
        </div>
      )}
      {tags && tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
          {tags.map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 10,
                backgroundColor: C.paper2,
                color: C.ink2,
                fontFamily: FONT.sans,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
