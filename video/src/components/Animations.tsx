import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from 'remotion'
import { C, FONT, FPS } from '../tokens'

// ─── Spring Config Presets ───
export const SPRING_BOUNCE = { damping: 10, stiffness: 120, mass: 0.8 }
export const SPRING_POP = { damping: 15, stiffness: 100, mass: 1 }
export const SPRING_SOFT = { damping: 20, stiffness: 80, mass: 1.2 }

// Safe spring wrapper — call inside component body
export const getSpringProgress = (
  frame: number,
  fps: number,
  delaySec: number,
  durationSec: number,
  springConfig = SPRING_POP
) => {
  const startFrame = delaySec * fps
  const endFrame = (delaySec + durationSec) * fps

  if (frame < startFrame) return 0
  if (frame > endFrame || durationSec <= 0) {
    return interpolate(frame, [startFrame, endFrame], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  }

  return spring({
    frame: frame - startFrame,
    fps,
    config: springConfig,
  })
}

export const Scene: React.FC<{
  children: React.ReactNode
  bg?: string
}> = ({ children, bg = C.bg }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT.sans,
      }}
    >
      {children}
    </div>
  )
}

export const FadeIn: React.FC<{
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
}> = ({ children, delay = 0, duration = 0.6, direction = 'up', distance = 40 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = interpolate(frame, [delay * fps, (delay + duration) * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })

  const opacity = progress
  const tx = direction === 'left' ? -distance : direction === 'right' ? distance : 0
  const ty = direction === 'up' ? distance : direction === 'down' ? -distance : 0

  return (
    <div
      style={{
        opacity,
        transform: `translate(${tx * (1 - progress)}px, ${ty * (1 - progress)}px)`,
      }}
    >
      {children}
    </div>
  )
}

export const ScaleIn: React.FC<{
  children: React.ReactNode
  delay?: number
  duration?: number
  from?: number
}> = ({ children, delay = 0, duration = 0.5, from = 0.8 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = interpolate(frame, [delay * fps, (delay + duration) * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })

  const scale = from + (1 - from) * progress

  return (
    <div
      style={{
        opacity: progress,
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  )
}

export const Typewriter: React.FC<{
  text: string
  delay?: number
  speed?: number
  style?: React.CSSProperties
}> = ({ text, delay = 0, speed = 2, style }) => {
  const frame = useCurrentFrame()
  const chars = Math.min(text.length, Math.floor((frame - delay * FPS) / speed))
  const visible = chars > 0 ? text.slice(0, Math.max(0, chars)) : ''

  return (
    <span style={style}>
      {visible}
      {chars < text.length && chars > 0 && (
        <span style={{ borderRight: '2px solid ' + C.chestnut, marginLeft: 2 }}>|</span>
      )}
    </span>
  )
}

export const NumberTicker: React.FC<{
  value: number
  delay?: number
  duration?: number
  suffix?: string
  style?: React.CSSProperties
  springConfig?: { damping: number; stiffness: number; mass: number }
}> = ({ value, delay = 0, duration = 1.5, suffix = '', style, springConfig }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = springConfig
    ? getSpringProgress(frame, fps, delay, duration, springConfig) * value
    : interpolate(frame, [delay * fps, (delay + duration) * fps], [0, value], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      })

  const display = Number.isInteger(value) ? Math.round(progress) : progress.toFixed(1)

  return (
    <span style={style}>
      {display}
      {suffix}
    </span>
  )
}

// ─── Spring-based Animation Components ───

export const SpringFadeIn: React.FC<{
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  springConfig?: { damping: number; stiffness: number; mass: number }
}> = ({ children, delay = 0, duration = 0.8, direction = 'up', distance = 40, springConfig = SPRING_POP }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const progress = getSpringProgress(frame, fps, delay, duration, springConfig)

  const opacity = progress
  const tx = direction === 'left' ? -distance : direction === 'right' ? distance : 0
  const ty = direction === 'up' ? distance : direction === 'down' ? -distance : 0

  return (
    <div
      style={{
        opacity,
        transform: `translate(${tx * (1 - progress)}px, ${ty * (1 - progress)}px)`,
      }}
    >
      {children}
    </div>
  )
}

export const SpringScaleIn: React.FC<{
  children: React.ReactNode
  delay?: number
  duration?: number
  from?: number
  springConfig?: { damping: number; stiffness: number; mass: number }
}> = ({ children, delay = 0, duration = 0.6, from = 0.8, springConfig = SPRING_POP }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const progress = getSpringProgress(frame, fps, delay, duration, springConfig)
  const scale = from + (1 - from) * progress

  return (
    <div
      style={{
        opacity: progress,
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  )
}

export const StaggerSpring: React.FC<{
  children: React.ReactNode[]
  baseDelay?: number
  staggerFrames?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  springConfig?: { damping: number; stiffness: number; mass: number }
}> = ({ children, baseDelay = 0, staggerFrames = 5, duration = 0.6, direction = 'up', distance = 30, springConfig = SPRING_POP }) => {
  const { fps } = useVideoConfig()
  const staggerSec = staggerFrames / fps

  return (
    <>
      {React.Children.map(children, (child, i) => (
        <SpringFadeIn
          key={i}
          delay={baseDelay + i * staggerSec}
          duration={duration}
          direction={direction}
          distance={distance}
          springConfig={springConfig}
        >
          {child}
        </SpringFadeIn>
      ))}
    </>
  )
}
