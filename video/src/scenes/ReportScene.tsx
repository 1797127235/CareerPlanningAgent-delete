import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion'
import { C, FONT } from '../tokens'
import { REPORT_DATA } from '../content'
import { MiniNavbar, PaperCard, ReportActionItem, fadeIn, slideUp } from '../components/UIPrimitives'
import { SpringScaleIn, SPRING_POP } from '../components/Animations'

const ReportScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = REPORT_DATA

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT.sans }}>
      <MiniNavbar activeLabel="职业报告" />
      <div style={{ padding: '24px 60px 40px', height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, letterSpacing: 1, marginBottom: 16, opacity: fadeIn(frame, fps, 0, 0.4) }}>
          06 · 职业报告
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 32 }}>
          <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <CoverPage d={d} frame={frame} fps={fps} />
            <ChaptersView d={d} frame={frame} fps={fps} />
          </div>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ActionPlanView d={d} frame={frame} fps={fps} />
            <EvidenceChain frame={frame} fps={fps} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const CoverPage: React.FC<{ d: typeof REPORT_DATA; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const anim = slideUp(frame, fps, 0.2, 0.6, 14)
  const targetVisible = fadeIn(frame, fps, 1, 0.5)

  return (
    <div style={{ opacity: anim.opacity, transform: `translateY(${anim.translateY}px)`, display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.ink, fontFamily: FONT.sans, lineHeight: 1.3 }}>{d.title}</div>
        <div style={{ fontSize: 14, color: C.inkMuted, marginTop: 8, fontFamily: FONT.sans }}>{d.date}</div>
      </div>
      <div style={{ opacity: targetVisible, padding: '10px 20px', borderRadius: 12, backgroundColor: `${C.chestnut}12`, border: `1px solid ${C.chestnut}30` }}>
        <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>目标岗位</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.chestnut, fontFamily: FONT.sans }}>{d.target}</div>
      </div>
    </div>
  )
}

const ChaptersView: React.FC<{ d: typeof REPORT_DATA; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const chapterStart = 5
  const activeIdx = Math.min(
    d.chapters.length - 1,
    Math.floor(
      Math.max(0, frame - chapterStart * fps) / (2 * fps)
    )
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {d.chapters.map((ch, i) => {
        const isActive = i === activeIdx && frame >= chapterStart * fps
        const isPast = i < activeIdx && frame >= chapterStart * fps
        const opacity = isPast ? 0.5 : isActive ? fadeIn(frame, fps, chapterStart + i * 2, 0.5) : frame >= chapterStart * fps ? 0.2 : 0
        const scale = isActive ? 1.02 : 1

        return (
          <div key={i} style={{ opacity, transform: `scale(${scale})` }}>
            <PaperCard delay={isActive ? chapterStart + i * 2 : 99}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: isActive ? C.chestnut : C.line, fontFamily: FONT.sans, lineHeight: 1 }}>{ch.numeral}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, fontFamily: FONT.sans, marginBottom: 4 }}>{ch.title}</div>
                  <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5, fontFamily: FONT.sans, maxHeight: 40, overflow: 'hidden' }}>{ch.summary}</div>
                </div>
              </div>
            </PaperCard>
          </div>
        )
      })}
    </div>
  )
}

const ActionPlanView: React.FC<{ d: typeof REPORT_DATA; frame: number; fps: number }> = ({ d, frame, fps }) => {
  const visible = fadeIn(frame, fps, 13, 0.5)
  return (
    <div style={{ opacity: visible }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10, letterSpacing: 1 }}>行动计划</div>
      <SpringScaleIn delay={13} duration={0.6} from={0.9} springConfig={SPRING_POP}>
        <div>
          {d.actionPlan.map((item, i) => (
            <ReportActionItem key={i} task={item.task} deadline={item.deadline} evidence={item.evidence} index={i} delay={13.3} />
          ))}
        </div>
      </SpringScaleIn>
    </div>
  )
}

const EvidenceChain: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const visible = fadeIn(frame, fps, 16, 0.5)
  const chain = ['简历', '画像', '岗位', 'JD', '面试', '成长', '报告']

  return (
    <div style={{ backgroundColor: `${C.chestnut}08`, border: `1px solid ${C.chestnut}20`, borderRadius: 16, padding: 20, opacity: visible, marginTop: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.chestnut, marginBottom: 10, letterSpacing: 1 }}>证据链闭环</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {chain.map((item, i) => {
          const itemOpacity = fadeIn(frame, fps, 16.3 + i * 0.2, 0.3)
          return (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: C.line, fontSize: 12, opacity: itemOpacity }}>→</span>}
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 8, backgroundColor: i === chain.length - 1 ? C.chestnut : C.paper2, color: i === chain.length - 1 ? C.white : C.ink2, fontWeight: 600, fontFamily: FONT.sans, opacity: itemOpacity }}>
                {item}
              </span>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default ReportScene
