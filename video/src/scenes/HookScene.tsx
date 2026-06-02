import React from 'react'
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion'
import {BG, C, FONT, FPS} from '../tokens'
import {easeOutExpo, progressBetween} from '../motion/cinematic'
import {panelGlowOrb, panelTopLine, premiumPanel, screenVignette, trailTag} from '../visualSystem'

const signalCards = [
  {label: '简历画像', detail: '理解学生当前能力结构', accent: C.scan, y: 404, tilt: -6},
  {label: '目标岗位', detail: '锁定更值得冲刺的方向', accent: C.resolve, y: 498, tilt: -2},
  {label: '真实 JD', detail: '拆解市场要求与关键缺口', accent: C.gapSharp, y: 592, tilt: -5},
  {label: '面试验证', detail: '确认建议能否转化成表达', accent: C.hit, y: 686, tilt: -1},
  {label: '成长手札', detail: '让记录继续回流并更新判断', accent: C.verdict, y: 780, tilt: -4},
]

const engineSteps = [
  '读取职业信号',
  '建立学生画像',
  '推荐目标岗位',
  '对齐真实 JD',
  '生成行动路径',
]

const coreX = 860
const coreY = 384
const signalX = 98
const signalWidth = 238

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame()

  const brandP = progressBetween(frame, 0, 1.2 * FPS, easeOutExpo)
  const coreP = progressBetween(frame, 3.4 * FPS, 6.0 * FPS, easeOutExpo)
  const panelP = progressBetween(frame, 3.8 * FPS, 6.6 * FPS, easeOutExpo)
  const thesisP = progressBetween(frame, 5.8 * FPS, 7.8 * FPS, easeOutExpo)
  const corePulse = spring({
    frame: Math.max(0, frame - 96),
    fps: FPS,
    config: {damping: 18, stiffness: 120, mass: 0.9},
  })

  return (
    <AbsoluteFill
      style={{
        background: BG.scan,
        color: C.white,
        fontFamily: FONT.sans,
        overflow: 'hidden',
      }}
    >
      <div style={{...screenVignette(0.34), zIndex: 1}} />
      <GridOverlay />
      <BackgroundGlow frame={frame} />
      <TopRail frame={frame} />

      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 118,
          width: 480,
          zIndex: 18,
          opacity: brandP,
          transform: `translateY(${(1 - brandP) * 18}px)`,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: C.scan,
            fontFamily: FONT.mono,
            letterSpacing: 2,
          }}
        >
          PRODUCT LAUNCH / 01
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 78,
            lineHeight: 0.92,
            fontWeight: 900,
            letterSpacing: -4.4,
          }}
        >
          CareerOS
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 24,
            lineHeight: 1.2,
            fontWeight: 800,
            color: C.verdict,
          }}
        >
          面向学生的职业智能体
        </div>
        <div
          style={{
            marginTop: 18,
            maxWidth: 436,
            fontSize: 15,
            lineHeight: 1.6,
            color: C.inkMuted,
          }}
        >
          从简历、目标岗位、真实 JD 到面试反馈与成长记录，CareerOS 开始接管职业决策里最关键的上下文。
        </div>
      </div>

      <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 8}}>
        {signalCards.map((card, index) => {
          const revealP = progressBetween(frame, 12 + index * 6, 34 + index * 7, easeOutExpo)
          const startX = signalX + signalWidth + 8
          const startY = card.y + 40
          return (
            <path
              key={card.label}
              d={`M ${startX} ${startY} Q ${520 + index * 24} ${startY - 16 + index * 14} ${coreX} ${coreY}`}
              stroke={card.accent}
              strokeWidth={1.4}
              strokeOpacity={(0.14 + revealP * 0.52) * coreP}
              strokeDasharray="7 10"
              fill="none"
            />
          )
        })}
        <path
          d={`M ${coreX + 176} ${coreY} Q 1146 ${coreY} 1248 314`}
          stroke={C.scan}
          strokeWidth={1.5}
          strokeOpacity={panelP * 0.44}
          strokeDasharray="8 11"
          fill="none"
        />
      </svg>

      {signalCards.map((card, index) => (
        <SignalCard key={card.label} frame={frame} card={card} index={index} />
      ))}

      <CorePanel coreP={coreP} pulse={corePulse} />
      <DecisionPanel frame={frame} panelP={panelP} />

      <div
        style={{
          position: 'absolute',
          right: 112,
          bottom: 112,
          width: 520,
          zIndex: 22,
          opacity: thesisP,
          transform: `translateY(${(1 - thesisP) * 26}px)`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: C.chestnut,
            letterSpacing: 1.1,
            marginBottom: 10,
          }}
        >
          不是信息更多
        </div>
        <div
          style={{
            fontSize: 76,
            lineHeight: 0.9,
            fontWeight: 900,
            letterSpacing: -4.2,
            color: C.verdict,
            textShadow: `0 0 ${28 + corePulse * 28}px rgba(232,212,184,0.18)`,
          }}
        >
          而是路径完整
        </div>
        <div
          style={{
            marginTop: 18,
            maxWidth: 470,
            fontSize: 15,
            lineHeight: 1.58,
            color: C.inkMuted,
          }}
        >
          CareerOS 将简历、岗位、JD、面试与成长记录收束成一条可执行、可验证、可持续更新的职业路径。
        </div>
      </div>
    </AbsoluteFill>
  )
}

const TopRail: React.FC<{frame: number}> = ({frame}) => {
  const bootP = progressBetween(frame, 0, 1.6 * FPS, easeOutExpo)
  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        right: 108,
        top: 56,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 30,
        opacity: bootP,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 44, height: 1, backgroundColor: C.scan}} />
        <div style={{fontSize: 12, fontWeight: 800, color: C.scan, fontFamily: FONT.mono, letterSpacing: 2}}>
          CAREER AGENT SYSTEM
        </div>
      </div>
      <div style={{...trailTag('scan'), padding: '8px 12px', fontSize: 11}}>system booting...</div>
    </div>
  )
}

const SignalCard: React.FC<{
  frame: number
  card: (typeof signalCards)[number]
  index: number
}> = ({frame, card, index}) => {
  const revealStart = 10 + index * 12
  const revealP = progressBetween(frame, revealStart, revealStart + 12, easeOutExpo)
  const settleP = progressBetween(frame, revealStart + 8, revealStart + 24, easeOutExpo)
  return (
    <div
      style={{
        left: signalX,
        top: card.y,
        width: signalWidth,
        padding: '12px 15px',
        ...premiumPanel('neutral'),
        position: 'absolute',
        borderLeft: `3px solid ${card.accent}`,
        boxShadow: `0 18px 44px rgba(0,0,0,0.22), 0 0 24px ${card.accent}22`,
        opacity: revealP,
        transform: `perspective(900px) rotateZ(${card.tilt - settleP * card.tilt * 0.38}deg) translateX(${(1 - revealP) * -42}px) translateY(${(1 - revealP) * 10 + (1 - settleP) * index * 1.6}px)`,
        filter: `blur(${Math.max(0, index - 2) * (1 - settleP) * 0.18}px)`,
      }}
    >
      <div style={panelGlowOrb('scan', {size: 160, right: -50, top: -56, opacity: 0.12})} />
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          color: card.accent,
          fontFamily: FONT.mono,
          letterSpacing: 1.5,
        }}
      >
        SIGNAL / 0{index + 1}
      </div>
      <div style={{marginTop: 10, fontSize: 18, lineHeight: 1.05, fontWeight: 900, color: C.white}}>{card.label}</div>
      <div style={{marginTop: 8, fontSize: 12, lineHeight: 1.45, color: C.inkMuted}}>{card.detail}</div>
    </div>
  )
}

const CorePanel: React.FC<{coreP: number; pulse: number}> = ({coreP, pulse}) => {
  return (
    <div
      style={{
        left: 666,
        top: 206,
        width: 392,
        padding: '24px 24px 26px',
        ...premiumPanel('scan', true),
        position: 'absolute',
        opacity: coreP,
        transform: `translateY(${(1 - coreP) * 20}px) scale(${0.96 + coreP * 0.04})`,
        zIndex: 16,
      }}
    >
      <div style={panelTopLine('scan')} />
      <div style={panelGlowOrb('scan', {size: 260, right: 30, top: -80, opacity: 0.18})} />
      <div
        style={{
          position: 'absolute',
          left: 88,
          top: 44,
          width: 216,
          height: 216,
          borderRadius: '50%',
          border: `1px solid rgba(247,241,235,${0.12 + pulse * 0.12})`,
          boxShadow: `0 0 ${70 + pulse * 70}px rgba(107,163,190,${0.08 + pulse * 0.08})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 116,
          top: 72,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,163,190,0.16) 0%, rgba(107,163,190,0.03) 58%, transparent 78%)',
          filter: `blur(${10 + pulse * 10}px)`,
        }}
      />
      <div style={{fontSize: 11, fontWeight: 900, color: C.scan, fontFamily: FONT.mono, letterSpacing: 1.7}}>
        AGENT CORE
      </div>
      <div style={{marginTop: 76, fontSize: 12, fontWeight: 800, color: C.chestnut, letterSpacing: 1.4, fontFamily: FONT.mono}}>
        CAREER ENGINE
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 58,
          lineHeight: 0.94,
          fontWeight: 900,
          letterSpacing: -2.8,
          color: C.white,
          textShadow: `0 0 ${20 + pulse * 18}px ${C.scanGlow}`,
        }}
      >
        路径生成中
      </div>
      <div style={{marginTop: 14, maxWidth: 296, fontSize: 14, lineHeight: 1.55, color: C.inkMuted}}>
        CareerOS 开始把碎片化职业信息压缩成一个持续协作的决策上下文。
      </div>
    </div>
  )
}

const DecisionPanel: React.FC<{frame: number; panelP: number}> = ({frame, panelP}) => {
  const sharpenP = progressBetween(frame, 98, 166, easeOutExpo)
  return (
    <>
      <div
        style={{
          position: 'absolute',
          right: 108,
          top: 160,
          width: 418,
          height: 506,
          borderRadius: 4,
          background: 'linear-gradient(180deg, rgba(247,241,235,0.028) 0%, rgba(247,241,235,0.012) 100%)',
          border: '1px solid rgba(247,241,235,0.05)',
          opacity: (0.2 + panelP * 0.22) * (1 - sharpenP * 0.68),
          filter: `blur(${10 - sharpenP * 6}px)`,
          zIndex: 14,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 138,
          top: 208,
          width: 350,
          height: 304,
          opacity: (0.28 + panelP * 0.18) * (1 - sharpenP * 0.82),
          filter: `blur(${14 - sharpenP * 8}px)`,
          zIndex: 15,
        }}
      >
        <div style={{position: 'absolute', left: 18, top: 16, width: 160, height: 18, backgroundColor: 'rgba(247,241,235,0.18)'}} />
        <div style={{position: 'absolute', left: 18, top: 46, width: 238, height: 18, backgroundColor: 'rgba(247,241,235,0.22)'}} />
        <div style={{position: 'absolute', left: 18, top: 74, width: 182, height: 18, backgroundColor: 'rgba(247,241,235,0.22)'}} />
        <div style={{position: 'absolute', left: 18, top: 124, width: 290, height: 4, backgroundColor: 'rgba(143,191,127,0.78)'}} />
        <div style={{position: 'absolute', left: 18, top: 166, width: 110, height: 56, backgroundColor: 'rgba(247,241,235,0.12)'}} />
        <div style={{position: 'absolute', left: 148, top: 166, width: 140, height: 56, backgroundColor: 'rgba(247,241,235,0.12)'}} />
      </div>
      <div
        style={{
          right: 126,
          top: 160,
          width: 420,
          padding: '22px 22px 18px',
          ...premiumPanel('resolve', true),
          position: 'absolute',
          opacity: panelP,
          transform: `translateX(${(1 - panelP) * 24}px) translateY(${(1 - panelP) * 16}px) scale(${0.96 + sharpenP * 0.04})`,
          zIndex: 18,
          boxShadow: '0 24px 60px rgba(0,0,0,0.28), 0 0 42px rgba(168,144,112,0.14)',
          filter: `blur(${(1 - sharpenP) * 2}px)`,
          borderLeft: `3px solid ${C.scan}`,
        }}
      >
      <div style={panelTopLine('resolve')} />
      <div style={panelGlowOrb('resolve', {size: 180, right: -40, top: -54, opacity: 0.12})} />
      <div style={{fontSize: 11, fontWeight: 900, color: C.chestnut, letterSpacing: 1.6, fontFamily: FONT.mono}}>
        DECISION ENGINE
      </div>
      <div style={{marginTop: 14, fontSize: 25, lineHeight: 1.15, fontWeight: 900, color: C.white}}>
        这不是更多信息堆叠，而是一次职
        <br />
        业路径重组。
      </div>
      <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10}}>
        {engineSteps.map((step, index) => {
          const stepP = progressBetween(frame, 82 + index * 6, 112 + index * 7, easeOutExpo)
          return (
            <div key={step} style={{opacity: stepP}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.white, marginBottom: 6, fontWeight: 700}}>
                <span>{step}</span>
                <span style={{fontFamily: FONT.mono, color: C.hit}}>ready</span>
              </div>
              <div style={{height: 4, backgroundColor: 'rgba(247,241,235,0.05)', overflow: 'hidden'}}>
                <div
                  style={{
                    width: `${stepP * 100}%`,
                    height: '100%',
                    backgroundColor: C.hit,
                    boxShadow: '0 0 14px rgba(143,191,127,0.24)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
        <div
          style={{
            border: '1px solid rgba(247,241,235,0.06)',
            backgroundColor: 'rgba(247,241,235,0.02)',
            padding: '14px 14px 12px',
          }}
        >
          <div style={{fontSize: 10, fontWeight: 800, color: C.chestnut, fontFamily: FONT.mono, letterSpacing: 1.3}}>INPUT</div>
          <div style={{marginTop: 8, fontSize: 30, fontWeight: 900, color: C.white}}>5类信号</div>
          <div style={{marginTop: 6, fontSize: 13, lineHeight: 1.45, color: C.inkMuted}}>画像 / 岗位 / JD / 面试 / 成长</div>
        </div>
        <div
          style={{
            border: '1px solid rgba(247,241,235,0.06)',
            backgroundColor: 'rgba(247,241,235,0.02)',
            padding: '14px 14px 12px',
          }}
        >
          <div style={{fontSize: 10, fontWeight: 800, color: C.chestnut, fontFamily: FONT.mono, letterSpacing: 1.3}}>OUTPUT</div>
          <div style={{marginTop: 8, fontSize: 30, fontWeight: 900, color: C.white}}>1条路径</div>
          <div style={{marginTop: 6, fontSize: 13, lineHeight: 1.45, color: C.inkMuted}}>可执行、可验证、可持续更新</div>
        </div>
      </div>
      </div>
    </>
  )
}

const GridOverlay: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '120px 120px',
        opacity: 0.06,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

const BackgroundGlow: React.FC<{frame: number}> = ({frame}) => {
  const drift = Math.sin(frame / 48)
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: -90 + drift * 12,
          top: 726,
          width: 440,
          height: 440,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,163,190,0.12) 0%, rgba(107,163,190,0.03) 44%, transparent 74%)',
          filter: 'blur(24px)',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -120,
          top: 88 + drift * 10,
          width: 520,
          height: 520,
          borderRadius: '50%',
          border: '1px solid rgba(247,241,235,0.06)',
          opacity: 0.34,
          zIndex: 0,
        }}
      />
    </>
  )
}
