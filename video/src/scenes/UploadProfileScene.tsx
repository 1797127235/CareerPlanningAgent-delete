import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from 'remotion'
import { C, FONT } from '../tokens'
import { UPLOAD_PROFILE_DATA } from '../content'
import { ScoreBar, SkillChip, MiniNavbar, fadeIn, slideUp } from '../components/UIPrimitives'

const UploadProfileScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = UPLOAD_PROFILE_DATA

  const phase2Start = 4
  const phase3Start = 8

  const isPhase1 = frame < phase2Start * fps
  const isPhase2 = frame >= phase2Start * fps && frame < phase3Start * fps
  const isPhase3 = frame >= phase3Start * fps

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar activeLabel="能力画像" />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', gap: 32, alignItems: 'center', justifyContent: 'center' }}>
          {isPhase1 && <Phase1 />}
          {isPhase2 && <Phase2 />}
          {isPhase3 && <Phase3 d={d} />}
        </div>
        <BottomSteps frame={frame} fps={fps} phase2Start={phase2Start} phase3Start={phase3Start} steps={d.steps} />
      </div>
    </AbsoluteFill>
  )
}

const Phase1: React.FC = () => {
  const opacity = fadeIn(useCurrentFrame(), useVideoConfig().fps, 0.2, 0.5)
  return (
    <div style={{ opacity, display: 'flex', gap: 24 }}>
      <div style={{ width: 260, height: 160, borderRadius: 16, border: `2px dashed ${C.chestnut}60`, backgroundColor: C.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: `${C.chestnut}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📄</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>拖入简历上传</div>
        <div style={{ fontSize: 12, color: C.inkMuted }}>PDF / DOC / TXT</div>
      </div>
      <div style={{ width: 260, height: 160, borderRadius: 16, border: `1px solid ${C.line}`, backgroundColor: C.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✏️</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>手动讲给我听</div>
        <div style={{ fontSize: 12, color: C.inkMuted }}>几个字就够了</div>
      </div>
    </div>
  )
}

const Phase2: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const progress = interpolate(frame, [4 * fps, 8 * fps], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const size = 90
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  const steps = ['上传简历', 'AI 解析', '生成画像']
  const stepDoneAt = [5, 6.5, 7.5]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48, opacity: fadeIn(frame, fps, 4, 0.3) }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={C.line} strokeWidth={stroke} fill="transparent" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={C.chestnut} strokeWidth={stroke} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((label, i) => {
          const done = frame >= stepDoneAt[i] * fps
          const active = !done && frame >= (stepDoneAt[i] - 0.8) * fps
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, display: 'flex', justifyContent: 'center' }}>
                {done ? <span style={{ fontSize: 14, color: C.success }}>✓</span> : <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: active ? C.chestnut : C.line }} />}
              </div>
              <span style={{ fontSize: 14, fontWeight: done ? 600 : 400, color: done ? C.ink : active ? C.chestnut : C.inkMuted, fontFamily: FONT.sans }}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Phase3: React.FC<{ d: typeof UPLOAD_PROFILE_DATA }> = ({ d }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const anim = slideUp(frame, fps, 8, 0.5, 14)

  return (
    <div style={{ display: 'flex', gap: 40, width: '100%', opacity: anim.opacity, transform: `translateY(${anim.translateY}px)` }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, fontFamily: FONT.sans }}>{d.name}</div>
              <div style={{ fontSize: 14, color: C.chestnut, fontFamily: FONT.sans, marginTop: 4 }}>目标：{d.target}</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: `linear-gradient(135deg, ${C.chestnut}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: C.white, fontWeight: 700 }}>林</div>
          </div>
        </div>
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>能力维度</div>
          {d.dimensionScores.map((dim, i) => (
            <ScoreBar key={i} label={dim.name} score={dim.score} delay={8.3 + i * 0.25} />
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>技能标签</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {d.skills.map((skill, i) => (
              <SkillChip key={i} label={`${skill.name} · ${skill.level}`} type="neutral" delay={8.6 + i * 0.12} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const BottomSteps: React.FC<{ frame: number; fps: number; phase2Start: number; phase3Start: number; steps: string[] }> = ({ frame, fps, phase2Start, phase3Start, steps }) => {
  const stepTimes = [0, phase2Start, phase3Start]
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexShrink: 0 }}>
      {steps.map((label, i) => {
        const done = frame >= stepTimes[i] * fps
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: done ? C.chestnut : C.line, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: done ? C.white : C.inkMuted, fontWeight: 700 }}>
              {done ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 13, color: done ? C.ink : C.inkMuted, fontWeight: done ? 600 : 400, fontFamily: FONT.sans }}>{label}</span>
            {i < 2 && <div style={{ width: 28, height: 2, backgroundColor: done ? C.chestnut : C.line }} />}
          </div>
        )
      })}
    </div>
  )
}

export default UploadProfileScene
