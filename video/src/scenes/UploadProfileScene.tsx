import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from 'remotion'
import { progressBetween } from '../motion/cinematic'
import { UPLOAD_PROFILE_DATA } from '../content'
import { BG, C, FONT, FPS } from '../tokens'
import { AgentPanel } from '../components/AgentPanel'

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
}

const extractPackets = [
  { label: '技能', detail: 'React / TypeScript / CSS', color: C.scan, startX: 620, startY: 260 },
  { label: '项目', detail: '协作白板项目', color: C.resolve, startX: 590, startY: 382 },
  { label: '信号', detail: '前端方向 / 执行能力', color: C.chestnut, startX: 560, startY: 504 },
]

const profileSignals = [
  { label: '编程基础', score: 82, color: C.resolve },
  { label: '前端开发', score: 75, color: C.resolve },
  { label: '系统设计', score: 45, color: C.gapSharp },
  { label: '软技能', score: 68, color: C.resolve },
  { label: '项目经验', score: 70, color: C.resolve },
]

export const UploadProfileScene: React.FC = () => {
  const frame = useCurrentFrame()
  const d = UPLOAD_PROFILE_DATA

  const ingestEnd = 2.2 * FPS
  const scanStart = 1.4 * FPS
  const scanEnd = 5.2 * FPS
  const extractStart = 4.5 * FPS
  const extractEnd = 7.1 * FPS
  const profileStart = 6.2 * FPS
  const profileEnd = 10.4 * FPS
  const loadingStart = 6.1 * FPS
  const loadingPeak = 7.6 * FPS
  const loadingFade = 8.5 * FPS
  const settleStart = 9.7 * FPS
  const settleEnd = 12 * FPS

  const ingestP = progressBetween(frame, 0, ingestEnd)
  const scanP = progressBetween(frame, scanStart, scanEnd)
  const extractP = progressBetween(frame, extractStart, extractEnd)
  const profileP = progressBetween(frame, profileStart, profileEnd)
  const loadingP = progressBetween(frame, loadingStart, loadingPeak)
  const loadingFadeP = progressBetween(frame, loadingPeak, loadingFade)
  const contentP = progressBetween(frame, loadingPeak + 8, profileEnd)
  const settleP = progressBetween(frame, settleStart, settleEnd)
  const agentP = progressBetween(frame, 8.1 * FPS, 11.3 * FPS)
  const dossierHeaderP = progressBetween(frame, 8.0 * FPS, 9.1 * FPS)
  const dossierBarsP = progressBetween(frame, 8.45 * FPS, 10.05 * FPS)
  const dossierChipsP = progressBetween(frame, 9.0 * FPS, 10.55 * FPS)
  const dossierJudgeP = progressBetween(frame, 9.6 * FPS, 11.2 * FPS)

  const documentLift = interpolate(frame, [0, ingestEnd], [52, 0], clamp)
  const dossierShift = interpolate(frame, [profileStart, profileEnd], [36, 0], clamp)

  return (
    <AbsoluteFill
      style={{
        background: BG.scan,
        color: C.white,
        fontFamily: FONT.sans,
        overflow: 'hidden',
      }}
    >
      <GridOverlay />
      <Atmosphere frame={frame} />

      <div
        style={{
          position: 'absolute',
          left: 108,
          top: 48,
          width: 520,
          zIndex: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 64, height: 1, backgroundColor: C.scan, boxShadow: `0 0 14px ${C.scanGlow}` }} />
          <span style={{ fontSize: 15, fontWeight: 900, color: C.scan, fontFamily: FONT.mono, letterSpacing: 2.2 }}>
            画像构建
          </span>
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 56,
            lineHeight: 0.94,
            fontWeight: 900,
            color: C.white,
            letterSpacing: -2.8,
            textShadow: `0 0 28px ${C.scanGlow}`,
          }}
        >
          先生成学生画像
        </div>
        <div
          style={{
            marginTop: 12,
            maxWidth: 448,
            fontSize: 16,
            lineHeight: 1.5,
            color: C.inkMuted,
          }}
        >
          先把简历里的经历、技能和职业信号拆出来，变成后续所有判断的统一输入。
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 108,
          top: 56,
          padding: '10px 14px',
          border: '1px solid rgba(107,163,190,0.12)',
          backgroundColor: `rgba(107,163,190,${0.04 + settleP * 0.03})`,
          fontSize: 12,
          color: C.inkMuted,
          fontFamily: FONT.mono,
          letterSpacing: 1.3,
          zIndex: 22,
        }}
      >
        简历 → 结构化画像
      </div>

      <div
        style={{
          position: 'absolute',
          left: 118,
          top: 230,
          width: 650,
          height: 776,
          transform: `translateY(${documentLift}px)`,
          opacity: 0.72 + ingestP * 0.16,
          filter: `brightness(${0.98 + ingestP * 0.1}) saturate(${0.98 + ingestP * 0.08})`,
          zIndex: 6,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: -44,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: 0.82,
          }}
        >
          <span
            style={{
              padding: '5px 10px',
              fontSize: 10,
              fontWeight: 800,
              fontFamily: FONT.mono,
              letterSpacing: 1.6,
              color: C.chestnut,
              backgroundColor: 'rgba(196,164,132,0.08)',
              border: '1px solid rgba(196,164,132,0.16)',
            }}
          >
            源文件
          </span>
          <span style={{ fontSize: 12, color: C.inkMuted, fontFamily: FONT.mono, letterSpacing: 1 }}>
            {d.fileName}
          </span>
        </div>

        <ResumeSheet frame={frame} ingestP={ingestP} scanP={scanP} name={d.name} />
      </div>

      <PipelineBridge frame={frame} extractP={extractP} />

      {extractPackets.map((packet, index) => (
        <ExtractionPacket
          key={packet.label}
          frame={frame}
          index={index}
          packet={packet}
          extractStart={extractStart}
          profileP={profileP}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          right: 112,
          top: 206,
          width: 850,
          minHeight: 814,
          padding: '62px 64px 58px',
          transform: `translateY(${dossierShift}px)`,
          opacity: 0.24 + profileP * 0.76,
          background: 'linear-gradient(180deg, rgba(247,241,235,0.042) 0%, rgba(247,241,235,0.018) 100%)',
          borderLeft: '1px solid rgba(247,241,235,0.1)',
          boxShadow: '0 34px 110px rgba(0,0,0,0.4), 0 0 70px rgba(107,163,190,0.07), inset 0 1px 0 rgba(247,241,235,0.06)',
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
          zIndex: 18,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 28,
            top: 28,
            width: 88,
            height: 1,
            backgroundColor: 'rgba(247,241,235,0.16)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 28,
            top: 28,
            width: 88,
            height: 1,
            backgroundColor: 'rgba(247,241,235,0.16)',
          }}
        />
        <ProfileLoadingPanel frame={frame} loadingP={loadingP} loadingFadeP={loadingFadeP} />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            opacity: contentP,
            transform: `translateY(${(1 - contentP) * 18}px)`,
          }}
        >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            opacity: dossierHeaderP,
            transform: `translateY(${(1 - dossierHeaderP) * 18}px)`,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.scan, fontFamily: FONT.mono, letterSpacing: 1.8 }}>
              画像生成完成
            </div>
            <div style={{ marginTop: 18, fontSize: 58, lineHeight: 1.02, fontWeight: 900, letterSpacing: -2.2 }}>
              {d.name}
            </div>
            <div style={{ marginTop: 8, fontSize: 18, color: C.verdict, fontWeight: 700 }}>
              {d.target}
            </div>
            <div
              style={{
                marginTop: 16,
                width: 92 + dossierHeaderP * 210,
                height: 4,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${C.verdict} 0%, ${C.scan} 72%, transparent 100%)`,
                boxShadow: `0 0 ${10 + dossierHeaderP * 22}px ${C.scanGlow}`,
                opacity: 0.5 + dossierHeaderP * 0.5,
              }}
            />
          </div>

          <div
            style={{
              padding: '10px 12px',
              border: '1px solid rgba(107,163,190,0.12)',
              backgroundColor: 'rgba(107,163,190,0.05)',
              fontSize: 11,
              color: C.scan,
              fontFamily: FONT.mono,
              letterSpacing: 1.2,
              boxShadow: `0 0 ${8 + dossierHeaderP * 18}px rgba(107,163,190,0.08)`,
            }}
          >
            证据来源：简历
          </div>
        </div>

        <div
          style={{
            marginTop: 38,
            display: 'grid',
            gridTemplateColumns: '1.24fr 0.96fr',
            gap: 42,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.inkMuted, fontFamily: FONT.mono, letterSpacing: 1.6 }}>
              能力画像
            </div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {profileSignals.map((signal, index) => {
                const rowP = progressBetween(frame, 8.55 * FPS + index * 5, 9.45 * FPS + index * 7)
                return (
                  <div
                    key={signal.label}
                    style={{
                      opacity: rowP * dossierBarsP,
                      transform: `translateX(${(1 - rowP) * 22}px)`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: signal.score <= 50 ? C.gapSharp : C.white,
                        }}
                      >
                        {signal.label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: signal.color, fontFamily: FONT.mono }}>
                        {Math.round(rowP * signal.score)}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 9,
                        width: '100%',
                        height: 6,
                        backgroundColor: 'rgba(247,241,235,0.05)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${rowP * signal.score}%`,
                          height: '100%',
                          backgroundColor: signal.color,
                          boxShadow: signal.score <= 50 ? `0 0 18px ${C.gapDim}` : `0 0 18px ${C.scanGlow}`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.inkMuted, fontFamily: FONT.mono, letterSpacing: 1.6 }}>
              识别技能
            </div>
            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {d.skills.map((skill, index) => {
                const chipP = progressBetween(frame, 9.05 * FPS + index * 5, 9.95 * FPS + index * 7)
                return (
                  <div
                    key={skill.name}
                    style={{
                      minWidth: 96,
                      padding: '10px 14px 11px',
                      border: '1px solid rgba(107,163,190,0.12)',
                      backgroundColor: 'rgba(107,163,190,0.05)',
                      opacity: chipP * dossierChipsP,
                      transform: `translateY(${(1 - chipP) * 16}px) scale(${0.92 + chipP * 0.08})`,
                      boxShadow: `0 0 ${8 + chipP * 18}px rgba(107,163,190,0.1)`,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{skill.name}</div>
                    <div style={{ marginTop: 2, fontSize: 10, color: C.inkMuted, fontFamily: FONT.mono }}>
                      {skill.level}
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              style={{
                marginTop: 34,
                padding: '20px 22px',
                backgroundColor: 'rgba(247,241,235,0.03)',
                border: '1px solid rgba(247,241,235,0.06)',
                opacity: settleP * dossierJudgeP,
                transform: `translateY(${(1 - dossierJudgeP) * 16}px)`,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: C.chestnut, letterSpacing: 1.6, fontFamily: FONT.mono }}>
                系统判断
              </div>
              <div style={{ marginTop: 12, fontSize: 22, lineHeight: 1.42, fontWeight: 800, color: C.verdict }}>
                  上传简历之后，系统先理解你是谁，再决定后面的职业判断怎么做。
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <AgentPanel
        side="left"
        top={804}
        width={520}
        opacity={agentP}
        title="系统先理解你的背景，再决定后面的职业判断怎么做。"
        detail="这一步不是生成一张静态画像，而是先确认你的技能基础、项目经历和职业倾向，后面推荐岗位、分析 JD、安排验证都会基于这份长期上下文。"
        tags={['已理解简历', '建立长期画像', '下一步：推荐岗位']}
      />
    </AbsoluteFill>
  )
}

const ResumeSheet: React.FC<{ frame: number; ingestP: number; scanP: number; name: string }> = ({ frame, ingestP, scanP, name }) => {
  const sheetSpring = spring({
    frame: Math.max(0, frame),
    fps: FPS,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  })

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 560,
        height: 680,
        transform: `scale(${0.88 + sheetSpring * 0.06}) rotate(-3deg)`,
        background: 'linear-gradient(180deg, rgba(255,252,248,0.99) 0%, rgba(246,241,235,0.97) 100%)',
        color: '#171717',
        boxShadow: '0 24px 56px rgba(0,0,0,0.22), 0 0 28px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.58)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 28%, transparent 72%, rgba(255,255,255,0.12) 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -120 + scanP * 520,
          top: 32,
          bottom: 32,
          width: 92,
          background: 'linear-gradient(90deg, rgba(107,163,190,0) 0%, rgba(107,163,190,0.08) 50%, rgba(255,255,255,0) 100%)',
          filter: 'blur(10px)',
          opacity: scanP > 0.02 && scanP < 0.98 ? 0.85 : 0,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 42px' }} />

      <div style={{ position: 'absolute', left: 46, right: 46, top: 54 }}>
        <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1.1 }}>{name}</div>
        <div style={{ marginTop: 6, fontSize: 16, color: '#505050' }}>计算机学生 / 前端方向</div>

        <Section title="技能" top={128} lines={['React / TypeScript / CSS', 'Node.js / 组件化开发', '前端交付 / 协作能力']} />
        <Section title="项目" top={286} lines={['协作白板平台项目', '性能优化与状态流梳理', '组件架构与迭代实现']} />
        <Section title="教育" top={470} lines={['计算机相关专业', '项目制课程训练', '重实践的作品积累']} />

        <div
          style={{
            position: 'absolute',
            left: -18,
            top: 104 + scanP * 430,
            width: 548,
            height: 64,
            borderLeft: `4px solid ${C.scan}`,
            background: 'linear-gradient(90deg, rgba(107,163,190,0.18) 0%, rgba(107,163,190,0.06) 46%, transparent 100%)',
            boxShadow: `0 0 24px ${C.scanGlow}`,
            opacity: scanP > 0.04 && scanP < 1 ? 1 : 0,
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 34,
          right: 34,
          bottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: ingestP,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, color: '#7b7b7b', fontFamily: FONT.mono, letterSpacing: 1.2 }}>
          识别 / 解析 / 归一化
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.scan, fontFamily: FONT.mono }}>
          {Math.round(ingestP * 100)}%
        </div>
      </div>
    </div>
  )
}

const Section: React.FC<{ title: string; top: number; lines: string[] }> = ({ title, top, lines }) => {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top }}>
      <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.4, color: '#787878', fontFamily: FONT.mono }}>
        {title}
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lines.map((line) => (
          <div key={line} style={{ height: 18, fontSize: 15, color: '#2d2d2d' }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}

const PipelineBridge: React.FC<{ frame: number; extractP: number }> = ({ frame, extractP }) => {
  const bridgeGlow = progressBetween(frame, 4.8 * FPS, 7.2 * FPS)
  return (
    <div
      style={{
        position: 'absolute',
        left: 700,
        top: 356,
        width: 340,
        height: 280,
        pointerEvents: 'none',
        zIndex: 12,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 78,
          width: 210 + bridgeGlow * 86,
          height: 96,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,163,190,0.14) 0%, rgba(107,163,190,0.05) 36%, transparent 72%)',
          filter: 'blur(18px)',
          opacity: bridgeGlow,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 68,
          width: 186 + bridgeGlow * 92,
          height: 116,
          borderRadius: '50%',
          border: '1px solid rgba(107,163,190,0.14)',
          boxShadow: `0 0 ${26 + bridgeGlow * 34}px rgba(107,163,190,0.12)`,
          opacity: 0.18 + bridgeGlow * 0.34,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 10,
          top: 118,
          width: `${110 + extractP * 178}px`,
          height: 2,
          background: 'linear-gradient(90deg, rgba(107,163,190,0.04) 0%, rgba(107,163,190,0.92) 52%, rgba(232,212,184,0.42) 100%)',
          boxShadow: `0 0 24px ${C.scanGlow}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 10,
          top: 136,
          width: `${94 + extractP * 164}px`,
          height: 1,
          background: 'linear-gradient(90deg, rgba(107,163,190,0.02) 0%, rgba(107,163,190,0.56) 54%, rgba(232,212,184,0.2) 100%)',
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 148 + extractP * 98,
          top: 104,
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: `1px solid ${C.scan}`,
          backgroundColor: 'rgba(107,163,190,0.06)',
          boxShadow: `0 0 32px ${C.scanGlow}, 0 0 72px rgba(107,163,190,0.18)`,
          opacity: extractP,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 164 + extractP * 98,
          top: 120,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: C.scan,
          boxShadow: `0 0 20px ${C.scanGlow}`,
          opacity: extractP,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 38,
          top: 184,
          fontSize: 12,
          color: C.scan,
          fontFamily: FONT.mono,
          letterSpacing: 1.7,
          opacity: progressBetween(frame, 4.7 * FPS, 6.2 * FPS),
        }}
      >
        提取 → 结构化 → 画像
      </div>
    </div>
  )
}

const ProfileLoadingPanel: React.FC<{ frame: number; loadingP: number; loadingFadeP: number }> = ({
  frame,
  loadingP,
  loadingFadeP,
}) => {
  const pulse = 0.76 + 0.24 * Math.sin(frame / 7)
  const opacity = loadingP * (1 - loadingFadeP)
  const sweepX = -180 + loadingP * 760

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: '88px 64px 64px',
        opacity,
        pointerEvents: 'none',
      }}
      >
      <div
        style={{
          position: 'absolute',
          left: 38,
          top: 128,
          width: 420 + loadingP * 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,163,190,0.18) 0%, rgba(107,163,190,0.06) 36%, transparent 74%)',
          filter: 'blur(28px)',
          opacity: 0.44 + loadingP * 0.34,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 120,
          top: 220,
          width: 220,
          height: 220,
          borderRadius: '50%',
          border: '1px solid rgba(107,163,190,0.12)',
          boxShadow: `0 0 ${40 + loadingP * 46}px rgba(107,163,190,0.12)`,
          opacity: 0.26 + loadingP * 0.34,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: sweepX,
          top: 60,
          bottom: 60,
          width: 180,
          background: 'linear-gradient(90deg, rgba(107,163,190,0) 0%, rgba(107,163,190,0.14) 50%, rgba(107,163,190,0) 100%)',
          filter: 'blur(16px)',
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 112,
          width: 320 + loadingP * 180,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,163,190,0.14) 0%, rgba(107,163,190,0.04) 42%, transparent 74%)',
          filter: 'blur(20px)',
          opacity: 0.4 + loadingP * 0.36,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.scan, fontFamily: FONT.mono, letterSpacing: 1.8 }}>
            画像生成中
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 52,
              lineHeight: 1.04,
              fontWeight: 900,
              letterSpacing: -2.1,
              color: 'rgba(247,241,235,0.92)',
              textShadow: `0 0 34px ${C.scanGlow}`,
            }}
          >
            系统正在组装你的画像
          </div>
        </div>
        <div
          style={{
            padding: '10px 14px',
            border: '1px solid rgba(107,163,190,0.14)',
            backgroundColor: 'rgba(107,163,190,0.05)',
            fontSize: 11,
            color: C.scan,
            fontFamily: FONT.mono,
            letterSpacing: 1.2,
          }}
        >
          加载中 {Math.round(loadingP * 100)}%
        </div>
      </div>

      <div
        style={{
          marginTop: 46,
          display: 'grid',
          gridTemplateColumns: '1.24fr 0.96fr',
          gap: 42,
        }}
      >
        <div>
          <div style={{ height: 14, width: 98, backgroundColor: `rgba(247,241,235,${0.14 + pulse * 0.1})`, boxShadow: `0 0 18px rgba(107,163,190,0.08)` }} />
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[0.94, 0.88, 0.72, 0.8, 0.76].map((width, index) => (
              <div key={index}>
                <div style={{ height: 12, width: `${120 + index * 18}px`, backgroundColor: `rgba(247,241,235,${0.12 + pulse * 0.1})` }} />
                <div
                  style={{
                    marginTop: 10,
                    width: '100%',
                    height: 6,
                    backgroundColor: 'rgba(247,241,235,0.055)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(8, loadingP * width * 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, rgba(107,163,190,0.28) 0%, rgba(107,163,190,0.88) 70%, rgba(247,241,235,0.28) 100%)',
                      boxShadow: `0 0 24px ${C.scanGlow}, 0 0 48px rgba(107,163,190,0.12)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ height: 14, width: 84, backgroundColor: `rgba(247,241,235,${0.14 + pulse * 0.1})`, boxShadow: `0 0 18px rgba(107,163,190,0.06)` }} />
          <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {['React', 'TypeScript', 'Node.js', 'CSS'].map((skill, index) => (
              <div
                key={skill}
                style={{
                  minWidth: 96,
                  padding: '10px 14px 11px',
                  border: '1px solid rgba(107,163,190,0.12)',
                  backgroundColor: `rgba(107,163,190,${0.05 + ((index % 2) + 1) * 0.012})`,
                  opacity: 0.62 + loadingP * 0.38,
                  boxShadow: '0 0 18px rgba(107,163,190,0.05)',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: 'rgba(247,241,235,0.92)' }}>{skill}</div>
                <div style={{ marginTop: 3, fontSize: 10, color: C.inkMuted, fontFamily: FONT.mono }}>
                  parsing
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 34,
              padding: '20px 22px',
              backgroundColor: 'rgba(247,241,235,0.036)',
              border: '1px solid rgba(247,241,235,0.06)',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: C.chestnut, letterSpacing: 1.6, fontFamily: FONT.mono }}>
              系统构建
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['正在提取经历信号', '正在识别能力结构', '正在生成后续判断基础'].map((line) => (
                <div key={line} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: C.scan,
                      boxShadow: `0 0 12px ${C.scanGlow}`,
                    }}
                  />
                  <div style={{ fontSize: 14, color: 'rgba(247,241,235,0.76)', fontWeight: 600 }}>{line}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ExtractionPacket: React.FC<{
  frame: number
  index: number
  packet: (typeof extractPackets)[number]
  extractStart: number
  profileP: number
}> = ({ frame, index, packet, extractStart, profileP }) => {
  const localP = progressBetween(frame, extractStart + index * 12, extractStart + 42 + index * 12)
  const handoffP = progressBetween(frame, extractStart + 32 + index * 10, extractStart + 66 + index * 10)
  const x = packet.startX + localP * 248 + handoffP * 34
  const y = packet.startY + 72 + (index - 1) * -52 * localP - handoffP * 14
  const scale = 0.82 + localP * 0.15 - handoffP * 0.08
  const opacity = localP * (1 - handoffP) * (1 - profileP * 0.55)

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 220,
        padding: '12px 14px',
        backgroundColor: 'rgba(10,14,20,0.72)',
        borderLeft: `3px solid ${packet.color}`,
        boxShadow: `0 18px 40px rgba(0,0,0,0.24), 0 0 24px ${packet.color}16`,
        opacity,
        transform: `scale(${scale})`,
        filter: `blur(${handoffP * 3}px)`,
        zIndex: 8,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 900, color: packet.color, fontFamily: FONT.mono, letterSpacing: 1.5 }}>
        {packet.label}
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: C.ink, fontWeight: 700 }}>
        {packet.detail}
      </div>
    </div>
  )
}

const GridOverlay: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
        backgroundSize: '160px 160px',
        opacity: 0.42,
      }}
    />
  )
}

const Atmosphere: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = interpolate(frame, [0, 12 * FPS], [0, 1], clamp)

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: -110 + drift * 60,
          top: 760 - drift * 22,
          width: 720,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,163,190,0.08) 0%, transparent 70%)',
          filter: 'blur(14px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -140 + drift * 36,
          top: 36 + drift * 18,
          width: 560,
          height: 560,
          borderRadius: '50%',
          border: '1px solid rgba(196,164,132,0.08)',
          boxShadow: '0 0 80px rgba(196,164,132,0.05)',
        }}
      />
    </>
  )
}
