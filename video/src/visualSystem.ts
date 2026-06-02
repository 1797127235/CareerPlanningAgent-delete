import React from 'react'
import {C, FONT} from './tokens'

type PanelTone = 'scan' | 'resolve' | 'gap' | 'verdict' | 'neutral'

const toneColor = (tone: PanelTone) => {
  switch (tone) {
    case 'scan':
      return C.scan
    case 'resolve':
      return C.resolve
    case 'gap':
      return C.gapSharp
    case 'verdict':
      return C.verdict
    case 'neutral':
    default:
      return C.white
  }
}

const toneGlow = (tone: PanelTone) => {
  switch (tone) {
    case 'scan':
      return C.scanGlow
    case 'resolve':
      return 'rgba(168,144,112,0.22)'
    case 'gap':
      return 'rgba(232,151,79,0.2)'
    case 'verdict':
      return 'rgba(232,212,184,0.18)'
    case 'neutral':
    default:
      return 'rgba(247,241,235,0.14)'
  }
}

const toneWash = (tone: PanelTone) => {
  switch (tone) {
    case 'scan':
      return 'rgba(107,163,190,0.06)'
    case 'resolve':
      return 'rgba(168,144,112,0.06)'
    case 'gap':
      return 'rgba(232,151,79,0.055)'
    case 'verdict':
      return 'rgba(232,212,184,0.055)'
    case 'neutral':
    default:
      return 'rgba(247,241,235,0.035)'
  }
}

export const premiumPanel = (tone: PanelTone, strong = false): React.CSSProperties => {
  const glow = toneGlow(tone)
  const wash = toneWash(tone)
  return {
    position: 'relative',
    background: strong
      ? `linear-gradient(180deg, ${wash} 0%, rgba(12,16,24,0.88) 38%, rgba(10,14,22,0.96) 100%)`
      : `linear-gradient(180deg, ${wash} 0%, rgba(247,241,235,0.016) 100%)`,
    border: `1px solid rgba(247,241,235,${strong ? 0.1 : 0.075})`,
    boxShadow: strong
      ? `0 30px 88px rgba(0,0,0,0.34), 0 0 54px ${glow}, inset 0 0 36px rgba(255,255,255,0.02)`
      : `0 18px 52px rgba(0,0,0,0.24), 0 0 28px ${glow}, inset 0 0 20px rgba(255,255,255,0.015)`,
    overflow: 'hidden',
  }
}

export const panelTopLine = (tone: PanelTone, inset = 20): React.CSSProperties => ({
  position: 'absolute',
  left: inset,
  right: inset,
  top: 0,
  height: 1,
  background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${toneColor(tone)}66 50%, rgba(255,255,255,0) 100%)`,
  opacity: 0.9,
})

export const panelGlowOrb = (
  tone: PanelTone,
  opts?: {right?: number; top?: number; size?: number; opacity?: number},
): React.CSSProperties => ({
  position: 'absolute',
  right: opts?.right ?? -110,
  top: opts?.top ?? -110,
  width: opts?.size ?? 260,
  height: opts?.size ?? 260,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${toneWash(tone).replace(/0\.\d+\)/, `${opts?.opacity ?? 0.22})`)} 0%, transparent 72%)`,
  filter: 'blur(10px)',
  pointerEvents: 'none',
})

export const chromeTag = (tone: PanelTone, dense = false): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: dense ? 8 : 10,
  padding: dense ? '7px 10px' : '9px 12px',
  border: `1px solid ${toneWash(tone).replace(/0\.\d+\)/, '0.18)')}`,
  backgroundColor: toneWash(tone),
  color: toneColor(tone),
  fontSize: dense ? 10 : 11,
  fontWeight: 900,
  fontFamily: FONT.mono,
  letterSpacing: dense ? 1.2 : 1.5,
})

export const sectionRailLine: React.CSSProperties = {
  width: 64,
  height: 1,
  backgroundColor: C.scan,
  boxShadow: `0 0 14px ${C.scanGlow}`,
}

export const sectionEyebrowText: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 900,
  color: C.scan,
  fontFamily: FONT.mono,
  letterSpacing: 2.2,
}

export const sectionTitleText = (large = false): React.CSSProperties => ({
  fontSize: large ? 62 : 56,
  lineHeight: 0.94,
  fontWeight: 900,
  color: C.white,
  letterSpacing: large ? -3.1 : -2.8,
  textShadow: `0 0 28px ${C.scanGlow}`,
})

export const sectionSubtitleText: React.CSSProperties = {
  marginTop: 12,
  maxWidth: 460,
  fontSize: 16,
  lineHeight: 1.56,
  color: C.inkMuted,
}

export const trailTag = (tone: PanelTone = 'scan'): React.CSSProperties => ({
  ...chromeTag(tone),
  padding: '10px 14px',
  color: C.inkMuted,
  letterSpacing: 1.3,
})

export const screenVignette = (opacity = 0.28): React.CSSProperties => ({
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at 50% 42%, transparent 0%, transparent 40%, rgba(3,6,10,0.16) 68%, rgba(3,6,10,0.36) 100%)',
  opacity,
  pointerEvents: 'none',
})
