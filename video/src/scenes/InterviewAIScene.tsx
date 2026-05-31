import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion'
import { C, FONT } from '../tokens'
import { INTERVIEW_AI_DATA } from '../content'
import { ScoreRing, MiniNavbar, fadeIn, delayFrame } from '../components/UIPrimitives'
import { SpringScaleIn, SPRING_POP } from '../components/Animations'

const InterviewAIScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = INTERVIEW_AI_DATA

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, letterSpacing: 1, marginBottom: 16, opacity: fadeIn(frame, fps, 0, 0.4) }}>
          04 · 面试教练
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 32 }}>
          <InterviewPhase d={d} frame={frame} fps={fps} />
          <AIImpactPhase d={d} frame={frame} fps={fps} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

const InterviewPhase: React.FC<{ d: typeof INTERVIEW_AI_DATA; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const questionVisible = fadeIn(frame, fps, 0.5, 0.5)
  const answerDelay = 2.5
  const f = delayFrame(frame, answerDelay, fps)
  const charCount = Math.min(d.answer.length, Math.floor(f / 2))
  const answerVisible = d.answer.slice(0, charCount)
  const showAnswer = frame >= answerDelay * fps

  const scoreVisible = fadeIn(frame, fps, 8, 0.5)
  const feedbackVisible = fadeIn(frame, fps, 10, 0.5)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20, opacity: questionVisible }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: C.white }}>AI</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.ink2, fontFamily: FONT.sans }}>面试官提问</span>
        </div>
        <div style={{ fontSize: 15, color: C.ink, lineHeight: 1.6, fontFamily: FONT.sans }}>{d.question}</div>
      </div>

      {showAnswer && (
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 20, opacity: fadeIn(frame, fps, answerDelay, 0.3) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${C.chestnut}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.white, fontWeight: 700 }}>林</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.ink2, fontFamily: FONT.sans }}>我的回答</span>
          </div>
          <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.7, fontFamily: FONT.sans, backgroundColor: C.paper2, padding: 14, borderRadius: 10, minHeight: 60, maxHeight: 120, overflow: 'hidden' }}>
            {answerVisible}
            {charCount < d.answer.length && <span style={{ borderRight: `2px solid ${C.chestnut}`, marginLeft: 1 }}> </span>}
          </div>
        </div>
      )}

      <div style={{ opacity: scoreVisible, display: 'flex', alignItems: 'center', gap: 20 }}>
        <SpringScaleIn delay={7.5} duration={1} from={0.6} springConfig={SPRING_POP}>
          <ScoreRing score={d.overallScore} size={80} delay={8} label="综合评分" />
        </SpringScaleIn>
        <div>
          {d.perQuestion.map((q, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
              <span style={{ fontSize: 12, color: C.ink2, fontFamily: FONT.sans }}>{q.question}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: q.score >= 80 ? C.chestnut : C.accent, fontFamily: FONT.sans, marginLeft: 12 }}>{q.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ opacity: feedbackVisible }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.success, marginBottom: 6 }}>亮点</div>
            {d.strengths.map((s, i) => <div key={i} style={{ fontSize: 12, color: C.ink, marginBottom: 3, opacity: fadeIn(frame, fps, 10.3 + i * 0.2, 0.3) }}>✓ {s}</div>)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 6 }}>改进</div>
            {d.improvements.map((s, i) => <div key={i} style={{ fontSize: 12, color: C.ink, marginBottom: 3, opacity: fadeIn(frame, fps, 10.6 + i * 0.2, 0.3) }}>○ {s}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

const AIImpactPhase: React.FC<{ d: typeof INTERVIEW_AI_DATA; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const visible = fadeIn(frame, fps, 14, 0.6)
  const impact = d.aiImpact
  const bars = [
    { label: 'AI 增强区', pct: impact.enhance, color: C.zoneSafe },
    { label: '转型过渡区', pct: impact.transition, color: C.zoneTransition },
    { label: '替代警惕区', pct: impact.danger, color: C.zoneDanger },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: visible }}>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 16, letterSpacing: 1 }}>{impact.label}</div>
        {bars.map((bar, i) => {
          const f = delayFrame(frame, 14.5, fps)
          const pct = Math.min(bar.pct, (f / (5 * fps)) * bar.pct * 3)
          return (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.ink, marginBottom: 6, fontFamily: FONT.sans }}>
                <span>{bar.label}</span>
                <span style={{ fontWeight: 700 }}>{Math.round(Math.min(pct, bar.pct))}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, backgroundColor: C.line, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(pct, bar.pct)}%`, height: '100%', borderRadius: 5, backgroundColor: bar.color }} />
              </div>
            </div>
          )
        })}
        <div style={{ marginTop: 16, padding: '12px 16px', backgroundColor: `${C.chestnut}08`, borderRadius: 10, borderLeft: `3px solid ${C.chestnut}`, fontSize: 13, color: C.ink2, lineHeight: 1.6, fontFamily: FONT.sans }}>
          了解 AI 对你目标岗位的影响，才能做出更聪明的职业选择。
        </div>
      </div>
    </div>
  )
}

export default InterviewAIScene
