import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion'
import { C, FONT } from '../tokens'
import { GROWTH_DATA_V2 } from '../content'
import { MiniNavbar, fadeIn, delayFrame } from '../components/UIPrimitives'
import { SpringScaleIn, SPRING_POP } from '../components/Animations'

const statusColor = (status: string) => {
  switch (status) {
    case '进行中': return C.blue
    case '通过': case '已完成': return C.zoneSafe
    case '待完成': return C.accent
    default: return C.inkMuted
  }
}

const GrowthScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = GROWTH_DATA_V2

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar activeLabel="成长手札" />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, letterSpacing: 1, marginBottom: 16, opacity: fadeIn(frame, fps, 0, 0.4) }}>
          05 · 成长账本
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 32 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InputArea frame={frame} fps={fps} />
            <EntriesList d={d} frame={frame} fps={fps} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AISuggestion d={d} frame={frame} fps={fps} />
            <ActionPlan d={d} frame={frame} fps={fps} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const InputArea: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const typewriterText = '完成字节跳动一面，问了 React 性能优化…'
  const f = delayFrame(frame, 0.5, fps)
  const charCount = Math.min(typewriterText.length, Math.floor(f / 2))
  const visible = typewriterText.slice(0, charCount)
  const showFilters = fadeIn(frame, fps, 2, 0.4)

  return (
    <>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 16, opacity: fadeIn(frame, fps, 0.3, 0.3) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, backgroundColor: C.paper2, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: C.ink, fontFamily: FONT.sans }}>
            {visible}
            {charCount < typewriterText.length && <span style={{ borderRight: `2px solid ${C.chestnut}`, marginLeft: 1 }}> </span>}
          </div>
          <div style={{ padding: '8px 18px', borderRadius: 10, backgroundColor: C.chestnut, color: C.white, fontSize: 13, fontWeight: 600 }}>记录</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, opacity: showFilters }}>
        {['全部', '项目', '面试', '学习'].map((f, i) => (
          <span key={i} style={{ padding: '4px 14px', borderRadius: 16, fontSize: 12, fontWeight: 600, backgroundColor: i === 0 ? `${C.chestnut}12` : C.paper2, color: i === 0 ? C.chestnut : C.ink2, border: i === 0 ? `1px solid ${C.chestnut}30` : `1px solid ${C.lineSoft}`, fontFamily: FONT.sans }}>
            {f}
          </span>
        ))}
      </div>
    </>
  )
}

const EntriesList: React.FC<{ d: typeof GROWTH_DATA_V2; frame: number; fps: number }> = ({ d, frame, fps }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {d.entries.map((entry, i) => {
        const opacity = fadeIn(frame, fps, 4 + i * 0.5, 0.4)
        return (
          <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 12, padding: '12px 16px', opacity }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: FONT.sans }}>{entry.title}</div>
              <div style={{ padding: '2px 10px', borderRadius: 8, backgroundColor: `${statusColor(entry.status)}15`, fontSize: 11, fontWeight: 600, color: statusColor(entry.status) }}>
                {entry.status}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 4, fontFamily: FONT.sans }}>{entry.subtitle}</div>
          </div>
        )
      })}
    </div>
  )
}

const AISuggestion: React.FC<{ d: typeof GROWTH_DATA_V2; frame: number; fps: number }> = ({ d, frame, fps }) => {
  return (
    <SpringScaleIn delay={7.5} duration={0.8} from={0.9} springConfig={SPRING_POP}>
      <div style={{ backgroundColor: `${C.chestnut}08`, border: `1px solid ${C.chestnut}20`, borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: C.chestnut, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.white }}>AI</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.chestnut, fontFamily: FONT.sans }}>智能建议</span>
        </div>
        <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, fontFamily: FONT.sans }}>{d.aiSuggestion}</div>
      </div>
    </SpringScaleIn>
  )
}

const ActionPlan: React.FC<{ d: typeof GROWTH_DATA_V2; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const visible = fadeIn(frame, fps, 13, 0.5)
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20, opacity: visible }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 12, letterSpacing: 1 }}>本周计划</div>
      {d.planItems.map((item, i) => {
        const itemOpacity = fadeIn(frame, fps, 14 + i * 0.5, 0.3)
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, opacity: itemOpacity }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${C.chestnut}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: C.chestnut, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
            <span style={{ fontSize: 13, color: C.ink, fontFamily: FONT.sans }}>{item}</span>
          </div>
        )
      })}
    </div>
  )
}

export default GrowthScene
