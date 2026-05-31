import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

interface Waypoint {
  x: number
  y: number
  frame: number
  click?: boolean
}

export const Cursor: React.FC<{
  waypoints: Waypoint[]
  size?: number
}> = ({ waypoints, size = 20 }) => {
  const frame = useCurrentFrame()

  let x = waypoints[0].x
  let y = waypoints[0].y
  let clicking = false

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i]
    const to = waypoints[i + 1]
    if (frame >= from.frame && frame <= to.frame) {
      const t = interpolate(frame, [from.frame, to.frame], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
      x = from.x + (to.x - from.x) * t
      y = from.y + (to.y - from.y) * t
      if (to.click && frame >= to.frame - 3) clicking = true
      break
    }
    if (frame > to.frame) {
      x = to.x
      y = to.y
      if (to.click && frame < to.frame + 8) clicking = true
    }
  }

  const last = waypoints[waypoints.length - 1]
  if (frame > last.frame) {
    x = last.x
    y = last.y
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        zIndex: 1000,
        pointerEvents: 'none',
        transform: clicking ? 'scale(0.8)' : 'scale(1)',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M5 3L5 19L9.5 14.5L14 21L17 19L12.5 12.5L19 12.5L5 3Z" fill="#1F1F1F" stroke="white" strokeWidth="1.5" />
      </svg>
      {clicking && (
        <div
          style={{
            position: 'absolute',
            left: -4,
            top: -4,
            width: size - 4,
            height: size - 4,
            borderRadius: '50%',
            border: '2px solid rgba(107, 62, 46, 0.5)',
          }}
        />
      )}
    </div>
  )
}
