import React from 'react'
import { C, FONT } from '../tokens'

export const EvidenceTag: React.FC<{ label: string }> = ({ label }) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: FONT.mono,
        color: C.scan,
        letterSpacing: 0.3,
      }}
    >
      <span style={{ opacity: 0.5, fontSize: 9 }}>来源:</span>
      <span>{label}</span>
    </span>
  )
}
