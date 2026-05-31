import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'
import { C, FONT } from '../tokens'
import { Scene, FadeIn } from '../components/Animations'

const UploadFlowScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const phase1End = 1.5
  const phase2End = 3
  const phase3End = 5.5
  const phase4End = 7

  const isPhase1 = frame < phase1End * fps
  const isPhase2 = frame >= phase1End * fps && frame < phase2End * fps
  const isPhase3 = frame >= phase2End * fps && frame < phase3End * fps
  const isPhase4 = frame >= phase3End * fps

  const cardW = 240
  const cardH = 140
  const cardRadius = 12
  const gap = 32

  const stepLabels = ['选择文件', '解析简历', '合并画像']
  const stepDoneAt = [phase1End, phase2End, phase3End]

  return (
    <Scene bg={C.bg}>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 36,
          fontFamily: FONT.sans,
        }}
      >
        <FadeIn delay={0}>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, textAlign: 'center' }}>
            简历上传 → AI 解析 → 能力画像
          </div>
        </FadeIn>

        {/* Center visual area */}
        <div style={{ position: 'relative', width: 700, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Phase 1: Two cards (upload + manual) */}
          {isPhase1 && (
            <div style={{ display: 'flex', gap }}>
              <FadeIn delay={0.2} duration={0.5}>
                <div style={{ width: cardW, height: cardH, borderRadius: cardRadius, border: `1px solid ${C.line}`, backgroundColor: C.white, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <span style={{ fontSize: 20 }}>📄</span>
                    <div style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', backgroundColor: C.chestnut }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>上传一份简历</div>
                    <div style={{ fontSize: 13, color: C.inkMuted, marginTop: 2 }}>PDF / Word / TXT</div>
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={0.4} duration={0.5}>
                <div style={{ width: cardW, height: cardH, borderRadius: cardRadius, border: `1px solid ${C.line}`, backgroundColor: C.white, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 20 }}>✏️</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>手动讲给我听</div>
                    <div style={{ fontSize: 13, color: C.inkMuted, marginTop: 2 }}>几个字就够了</div>
                  </div>
                </div>
              </FadeIn>
            </div>
          )}

          {/* Phase 2: File drop animation */}
          {isPhase2 && (
            <FadeIn delay={0} duration={0.3}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <div style={{ padding: '8px 20px', borderRadius: 20, border: `1px solid ${C.chestnut}40`, backgroundColor: C.white, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: 14 }}>📄</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>resume_zhangsan.pdf</span>
                </div>
                <div style={{ width: 400, height: 2, backgroundColor: C.chestnut, opacity: 0.3, borderRadius: 1 }} />
                <div style={{ fontSize: 14, color: C.inkMuted }}>文件已选择，正在准备处理…</div>
              </div>
            </FadeIn>
          )}

          {/* Phase 3: Typesetting progress ring + steps */}
          {isPhase3 && (() => {
            const progress = interpolate(frame, [phase2End * fps, phase3End * fps], [0, 100], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
            const size = 80
            const stroke = 4
            const radius = (size - stroke) / 2
            const circumference = 2 * Math.PI * radius
            const offset = circumference - (progress / 100) * circumference

            return (
              <FadeIn delay={0} duration={0.3}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                  <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={size / 2} cy={size / 2} r={radius} stroke={C.line} strokeWidth={stroke} fill="transparent" />
                    <circle cx={size / 2} cy={size / 2} r={radius} stroke={C.chestnut} strokeWidth={stroke} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {stepLabels.map((label, i) => {
                      const done = frame >= stepDoneAt[i] * fps
                      const active = !done && frame >= (stepDoneAt[i] - 1) * fps
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 18, display: 'flex', justifyContent: 'center' }}>
                            {done ? (
                              <span style={{ fontSize: 14, color: C.success }}>✓</span>
                            ) : (
                              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: active ? C.chestnut : C.line }} />
                            )}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: done ? 600 : 400, color: done ? C.ink : active ? C.chestnut : C.inkMuted }}>
                            {label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: C.inkMuted }}>
                  正在将你的经历排版为档案…
                </div>
              </FadeIn>
            )
          })()}

          {/* Phase 4: Bound book → profile generated */}
          {isPhase4 && (() => {
            const bookProgress = interpolate(frame, [phase3End * fps, (phase3End + 0.8) * fps], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })
            const leftX = -8 * bookProgress
            const rightX = 8 * bookProgress
            const stampScale = interpolate(frame, [(phase3End + 0.3) * fps, (phase3End + 0.8) * fps], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.34, 1.56, 0.64, 1),
            })

            const textOpacity = interpolate(frame, [(phase3End + 1) * fps, (phase3End + 1.5) * fps], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })

            return (
              <FadeIn delay={0} duration={0.3}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 160, height: 200, borderRadius: '8px 0 0 8px', border: `1px solid ${C.line}`, backgroundColor: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateX(${leftX}px)`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: 13, color: C.inkMuted }}>简历原件</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                      <div style={{ width: 0, height: 180, borderLeft: '2px dashed rgba(107,62,46,0.3)' }} />
                      <div style={{ position: 'absolute', top: '50%', transform: `translate(-50%, -50%) scale(${stampScale})`, width: 52, height: 52, borderRadius: '50%', backgroundColor: C.chestnut, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>归档</span>
                      </div>
                    </div>
                    <div style={{ width: 160, height: 200, borderRadius: '0 8px 8px 0', border: `1px solid ${C.line}`, backgroundColor: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateX(${rightX}px)`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: 13, color: C.inkMuted }}>能力画像</span>
                    </div>
                  </div>
                  <div style={{ opacity: textOpacity, fontSize: 16, color: C.chestnutLight, fontWeight: 600 }}>
                    档案已归档，能力画像生成完毕 ✓
                  </div>
                </div>
              </FadeIn>
            )
          })()}
        </div>

        {/* Bottom step indicator */}
        <div style={{ display: 'flex', gap: 40 }}>
          {[
            { icon: '📄', label: '上传简历', time: phase1End },
            { icon: '⚙️', label: 'AI 解析', time: phase3End },
            { icon: '📊', label: '能力画像', time: phase4End },
          ].map((s, i) => {
            const done = frame >= s.time * fps
            return (
              <FadeIn key={i} delay={0.3 + i * 0.2}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: done ? C.chestnut : C.line, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 14, color: done ? C.ink : C.inkMuted, fontWeight: done ? 600 : 400 }}>
                    {s.icon} {s.label}
                  </span>
                  {i < 2 && (
                    <div style={{ width: 32, height: 2, backgroundColor: done ? C.chestnut : C.line, marginLeft: 4 }} />
                  )}
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </Scene>
  )
}

export default UploadFlowScene
