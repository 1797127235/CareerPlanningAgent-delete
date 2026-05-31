import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'
import { C, FONT } from '../tokens'

export const BrowserFrame: React.FC<{
  children: React.ReactNode
  url?: string
  width?: number
  height?: number
  delay?: number
  scale?: number
}> = ({ children, url = 'github.com/1797127235/CareerPlanningAgent', width = 1200, height = 700, delay = 0, scale = 1 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = interpolate(frame, [delay * fps, (delay + 0.7) * fps], [0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })

  const opacity = interpolate(frame, [delay * fps, (delay + 0.5) * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const barH = 40
  const dotR = 6
  const dotColors = ['#FF5F57', '#FFBD2E', '#28CA42']

  return (
    <div
      style={{
        width: width,
        height: height + barH,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: C.white,
        boxShadow: `0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.08)`,
        opacity,
        transform: `scale(${progress * scale})`,
      }}
    >
      <div
        style={{
          height: barH,
          backgroundColor: '#F0ECE5',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 16,
          paddingRight: 16,
          gap: 8,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        {dotColors.map((c, i) => (
          <div key={i} style={{ width: dotR * 2, height: dotR * 2, borderRadius: dotR, backgroundColor: c }} />
        ))}
        <div
          style={{
            marginLeft: 16,
            flex: 1,
            height: 26,
            borderRadius: 6,
            backgroundColor: C.white,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 12,
            fontSize: 13,
            color: C.inkMuted,
            fontFamily: FONT.sans,
          }}
        >
          {url}
        </div>
      </div>
      <div style={{ width: width, height: height, overflow: 'hidden' }}>{children}</div>
    </div>
  )
}
