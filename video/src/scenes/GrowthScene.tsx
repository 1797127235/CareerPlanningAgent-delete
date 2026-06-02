import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { GROWTH_DATA_V2 } from '../content'
import { BG, C, FONT } from '../tokens'
import { easeOutExpo, progressBetween } from '../motion/cinematic'
import { panelGlowOrb, panelTopLine, premiumPanel, screenVignette, trailTag } from '../visualSystem'

const FPS = 30

const snapshots = [
  {
    type: '学习记录',
    title: '系统设计课程笔记',
    note: '补完模块边界、微前端与组件通信章节，并整理成自己的知识卡片。',
    tag: '学习',
    accent: C.scan,
  },
  {
    type: '项目快照',
    title: '白板协作项目性能优化',
    note: '记录了卡顿定位过程、关键优化动作，以及优化前后的结果对比。',
    tag: '项目',
    accent: C.resolve,
  },
  {
    type: '模拟面试',
    title: '第 2 轮前端面试复盘',
    note: '面试官认可项目深度，但追问系统设计时回答不够稳定，需要继续补齐。',
    tag: '面试',
    accent: C.gapSharp,
  },
  {
    type: '反思与待办',
    title: '本周成长手札总结',
    note: '前端实践保持优势，短板仍集中在系统设计与 SSR，待办需要重新排序。',
    tag: '反思',
    accent: C.chestnut,
  },
]

const extractedSignals = [
  '系统设计仍是最核心短板',
  '项目深度已经可以支撑前端岗位表达',
  '模拟面试反馈可用于更新下一轮追问',
]

const notebookCarryover = [
  {
    title: '待办续写',
    accent: C.resolve,
    rows: ['补一轮 SSR 场景笔记', '把系统设计追问整理成卡片', '下次验证前补一次项目表达'],
  },
  {
    title: '原始摘录',
    accent: C.scan,
    rows: ['“性能优化过程已经能讲清，但证据还不够完整。”', '“系统设计回答有思路，但还不够稳定。”'],
  },
]

export const GrowthScene: React.FC = () => {
  const frame = useCurrentFrame()
  const d = GROWTH_DATA_V2

  const notebookP = progressBetween(frame, 0, 2.8 * FPS, easeOutExpo)
  const cardsP = progressBetween(frame, 1.4 * FPS, 5.8 * FPS, easeOutExpo)
  const signalsP = progressBetween(frame, 4.2 * FPS, 7.2 * FPS, easeOutExpo)
  const adviceP = progressBetween(frame, 6.6 * FPS, 10 * FPS, easeOutExpo)
  const queueP = progressBetween(frame, 3.2 * FPS, 6.2 * FPS, easeOutExpo)
  const drift = interpolate(frame, [0, 10 * FPS], [0, 1])

  return (
    <AbsoluteFill
      style={{
        background: BG.scan,
        color: C.white,
        fontFamily: FONT.sans,
        overflow: 'hidden',
      }}
    >
      <div style={{ ...screenVignette(0.24), zIndex: 1 }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)',
          backgroundSize: '150px 150px',
          opacity: 0.28,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -80 + drift * 30,
          top: 720 - drift * 24,
          width: 760,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,144,112,0.08) 0%, transparent 72%)',
          filter: 'blur(18px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -60,
          top: 30 + drift * 14,
          width: 540,
          height: 540,
          borderRadius: '50%',
          border: '1px solid rgba(107,163,190,0.08)',
          boxShadow: '0 0 100px rgba(107,163,190,0.06)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 88,
          top: 48,
          width: 620,
          zIndex: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 64, height: 1, backgroundColor: C.scan, boxShadow: `0 0 14px ${C.scanGlow}` }} />
          <div style={{ fontSize: 15, fontWeight: 900, color: C.scan, fontFamily: FONT.mono, letterSpacing: 2.2 }}>
            成长手札
          </div>
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 56,
            lineHeight: 0.94,
            fontWeight: 900,
            color: C.white,
            letterSpacing: -2.8,
          }}
        >
          用事件快照持续记录成长
        </div>
        <div
          style={{
            marginTop: 12,
            maxWidth: 520,
            fontSize: 16,
            lineHeight: 1.52,
            color: C.inkMuted,
          }}
        >
          学习、项目、面试、反思和待办都会进入这本成长手札。CareerOS 智能体会持续读取这些记录，再更新你的建议和下一步验证方式。
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 88,
          top: 56,
          ...trailTag('scan'),
          zIndex: 12,
        }}
      >
        事件快照 → 智能体读取 → 建议更新
      </div>

      <div
        style={{
          position: 'absolute',
          left: 88,
          top: 220,
          width: 900,
          height: 780,
          padding: '28px 28px 26px',
          ...premiumPanel('scan', true),
          transform: `translateY(${(1 - notebookP) * 26}px)`,
          opacity: notebookP,
          zIndex: 10,
        }}
      >
        <div style={panelTopLine('scan')} />
        <div style={panelGlowOrb('scan', { size: 220, right: -60, top: -70, opacity: 0.12 })} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.scan, fontFamily: FONT.mono, letterSpacing: 1.6 }}>
              学生成长手札
            </div>
            <div style={{ marginTop: 10, fontSize: 34, lineHeight: 1, fontWeight: 900, color: C.white }}>
              本周事件快照
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', maxWidth: 360, justifyContent: 'flex-end' }}>
            {['学习', '项目', '面试', '反思', '待办'].map((tab, i) => {
              const p = progressBetween(frame, 10 + i * 4, 30 + i * 5, easeOutExpo)
              return (
                <div
                  key={tab}
                  style={{
                    padding: '7px 12px',
                    border: '1px solid rgba(247,241,235,0.08)',
                    backgroundColor: 'rgba(247,241,235,0.025)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.white,
                    opacity: p,
                    transform: `translateY(${(1 - p) * 8}px)`,
                  }}
                >
                  {tab}
                </div>
              )
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: 26,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 18,
          }}
        >
          {snapshots.map((item, i) => {
            const p = progressBetween(frame, 18 + i * 8, 54 + i * 9, easeOutExpo)
            return (
              <div
                key={item.title}
                style={{
                  minHeight: 182,
                  padding: '18px 18px 16px',
                  background: 'linear-gradient(180deg, rgba(107,163,190,0.05) 0%, rgba(12,18,28,0.18) 100%)',
                  border: '1px solid rgba(107,163,190,0.1)',
                  borderLeft: `4px solid ${item.accent}`,
                  boxShadow: '0 18px 34px rgba(0,0,0,0.16), inset 0 0 24px rgba(107,163,190,0.03)',
                  opacity: p * cardsP,
                  transform: `translateY(${(1 - p) * 18}px)`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: item.accent, fontFamily: FONT.mono, letterSpacing: 1.3 }}>
                    {item.type}
                  </div>
                  <div
                    style={{
                      padding: '4px 8px',
                      border: '1px solid rgba(247,241,235,0.08)',
                      backgroundColor: 'rgba(247,241,235,0.03)',
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.inkMuted,
                      fontFamily: FONT.mono,
                    }}
                  >
                    {item.tag}
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 24, lineHeight: 1.12, fontWeight: 800, color: C.white }}>
                  {item.title}
                </div>
                <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.55, color: C.ink }}>
                  {item.note}
                </div>
              </div>
            )
          })}
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: '1.08fr 0.92fr',
            gap: 18,
          }}
        >
          {notebookCarryover.map((block, i) => {
            const p = progressBetween(frame, 44 + i * 8, 84 + i * 8, easeOutExpo)
            return (
              <div
                key={block.title}
                style={{
                  minHeight: 184,
                  padding: '18px 18px 16px',
                  background: 'linear-gradient(180deg, rgba(107,163,190,0.04) 0%, rgba(12,18,28,0.14) 100%)',
                  border: '1px solid rgba(107,163,190,0.09)',
                  borderLeft: `4px solid ${block.accent}`,
                  opacity: p * cardsP,
                  transform: `translateY(${(1 - p) * 16}px)`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: block.accent,
                    fontFamily: FONT.mono,
                    letterSpacing: 1.3,
                  }}
                >
                  {block.title}
                </div>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {block.rows.map((row, rowIndex) => (
                    <div
                      key={row}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        opacity: progressBetween(frame, 52 + i * 10 + rowIndex * 4, 96 + i * 10 + rowIndex * 4, easeOutExpo),
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          marginTop: 7,
                          backgroundColor: block.accent,
                          boxShadow: block.accent === C.scan ? `0 0 10px ${C.scanGlow}` : 'none',
                        }}
                      />
                      <div style={{ fontSize: 15, lineHeight: 1.48, color: C.ink }}>
                        {row}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 88,
          top: 220,
          width: 560,
          height: 780,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          zIndex: 11,
        }}
      >
        <div
          style={{
            padding: '22px 22px 20px',
            ...premiumPanel('scan', true),
            opacity: signalsP,
            transform: `translateY(${(1 - signalsP) * 16}px)`,
          }}
        >
          <div style={panelTopLine('scan')} />
          <div style={panelGlowOrb('scan', { size: 180, right: -40, top: -54, opacity: 0.12 })} />
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
          <div style={{ marginTop: 12, fontSize: 28, lineHeight: 1.14, fontWeight: 900, color: C.white }}>
            CareerOS 正在读取这本成长手札，判断哪些变化会影响下一步策略。
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {extractedSignals.map((signal, i) => {
              const p = progressBetween(frame, 4.6 * FPS + i * 7, 7.8 * FPS + i * 8, easeOutExpo)
              return (
                <div
                  key={signal}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    opacity: p,
                    transform: `translateX(${(1 - p) * 14}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      marginTop: 7,
                      backgroundColor: C.scan,
                      boxShadow: `0 0 12px ${C.scanGlow}`,
                    }}
                  />
                  <div style={{ fontSize: 15, lineHeight: 1.45, color: C.ink }}>
                    {signal}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          style={{
            padding: '18px 20px 18px',
            ...premiumPanel('scan'),
            opacity: 0.28 + queueP * 0.72,
            transform: `translateY(${(1 - queueP) * 10}px)`,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: C.scan, fontFamily: FONT.mono, letterSpacing: 1.5 }}>
            事件索引
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '学习记录已读', detail: '系统设计课程笔记', status: '吸收中' },
              { label: '项目快照已读', detail: '性能优化过程与结果对比', status: '已纳入判断' },
              { label: '面试反馈已读', detail: '系统设计回答仍需补齐', status: '影响下一步建议' },
            ].map((item, i) => {
              const p = progressBetween(frame, 3.6 * FPS + i * 6, 6.8 * FPS + i * 6, easeOutExpo)
              return (
                <div
                  key={item.label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 12,
                    alignItems: 'baseline',
                    opacity: p,
                    transform: `translateX(${(1 - p) * 12}px)`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>{item.label}</div>
                    <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.45, color: C.inkMuted }}>{item.detail}</div>
                  </div>
                  <div
                    style={{
                      padding: '4px 8px',
                      border: '1px solid rgba(107,163,190,0.14)',
                      backgroundColor: 'rgba(107,163,190,0.06)',
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.scan,
                      fontFamily: FONT.mono,
                    }}
                  >
                    {item.status}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          style={{
            padding: '24px 24px 22px',
            ...premiumPanel('scan'),
            opacity: 0.18 + adviceP * 0.82,
            transform: `translateY(${(1 - adviceP) * 14}px)`,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: C.scan, fontFamily: FONT.mono, letterSpacing: 1.5 }}>
            建议更新
          </div>
          <div style={{ marginTop: 12, fontSize: 30, lineHeight: 1.18, fontWeight: 900, color: C.white }}>
            {d.aiSuggestion}
          </div>
          <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.55, color: C.inkMuted }}>
            这不是一次性建议，而是基于你最新的学习、项目、面试和反思记录重新整理出来的优先级。
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 12,
            opacity: Math.max(0.22, queueP * 0.72, adviceP),
          }}
        >
          {d.planItems.map((item, i) => {
            const p = progressBetween(frame, 7.4 * FPS + i * 6, 10.4 * FPS + i * 6, easeOutExpo)
            return (
              <div
                key={item}
                style={{
                  padding: '16px 18px',
                  borderLeft: `4px solid ${C.scan}`,
                  backgroundColor: 'rgba(107,163,190,0.08)',
                  border: '1px solid rgba(107,163,190,0.14)',
                  opacity: p,
                  transform: `translateX(${(1 - p) * 18}px)`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.white, lineHeight: 1.3 }}>{item}</div>
                  <div style={{ fontSize: 11, color: C.inkMuted, fontFamily: FONT.mono, letterSpacing: 1.2 }}>
                    Next {i + 1}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div
          style={{
            marginTop: 'auto',
            padding: '18px 20px',
            ...premiumPanel('scan'),
            opacity: adviceP,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: C.scan, fontFamily: FONT.mono, letterSpacing: 1.5 }}>
            持续跟进
          </div>
          <div style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5, fontWeight: 700, color: C.white }}>
            后面的画像、建议和模拟面试都会继续引用这本成长手札，而不是重新从零开始判断。
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
