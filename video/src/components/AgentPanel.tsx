import React from 'react'
import { C, FONT } from '../tokens'

type AgentPanelProps = {
  title: string
  detail: string
  tags?: string[]
  opacity?: number
  width?: number
  side?: 'left' | 'right'
  left?: number
  right?: number
  top?: number
  bottom?: number
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  title,
  detail,
  tags = [],
  opacity = 1,
  width = 420,
  side = 'right',
  left,
  right,
  top,
  bottom,
}) => {
  const positionStyle =
    typeof left === 'number' || typeof right === 'number'
      ? {
          left: typeof left === 'number' ? left : ('auto' as const),
          right: typeof right === 'number' ? right : ('auto' as const),
        }
      : side === 'right'
        ? { right: 88 as number, left: 'auto' as const }
        : { left: 88 as number, right: 'auto' as const }

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyle,
        top,
        bottom,
        width,
        padding: '18px 20px 18px',
        background: 'linear-gradient(180deg, rgba(12,18,28,0.88) 0%, rgba(12,18,28,0.72) 100%)',
        border: '1px solid rgba(107,163,190,0.16)',
        boxShadow: '0 18px 40px rgba(0,0,0,0.22), inset 0 0 40px rgba(107,163,190,0.04)',
        backdropFilter: 'blur(10px)',
        opacity,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: C.scan,
            boxShadow: `0 0 12px ${C.scanGlow}`,
          }}
        />
        <div style={{ fontSize: 11, fontWeight: 900, color: C.scan, fontFamily: FONT.mono, letterSpacing: 1.6 }}>
          CareerOS 智能体
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 22, lineHeight: 1.28, fontWeight: 800, color: C.white }}>
        {title}
      </div>

      <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: C.inkMuted }}>
        {detail}
      </div>

      {tags.length ? (
        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                padding: '6px 10px',
                border: '1px solid rgba(107,163,190,0.14)',
                backgroundColor: 'rgba(107,163,190,0.05)',
                fontSize: 11,
                fontWeight: 700,
                color: C.white,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
