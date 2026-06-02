import React from 'react'
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion'
import {CTA_V2} from '../content'
import {BG, C, FONT, FPS} from '../tokens'
import {easeOutExpo, progressBetween} from '../motion/cinematic'
import {
  panelGlowOrb,
  panelTopLine,
  premiumPanel,
  screenVignette,
  sectionEyebrowText,
  sectionRailLine,
  trailTag,
} from '../visualSystem'

const traceSignals = [
  {label: '画像', detail: '理解学生当前能力结构', accent: C.scan},
  {label: '岗位', detail: '推荐更匹配的目标方向', accent: C.resolve},
  {label: 'JD', detail: '判断真实要求与关键差距', accent: C.gapSharp},
  {label: '面试', detail: '验证建议是否转化成表达', accent: C.hit},
  {label: '成长', detail: '持续回流并更新下一步策略', accent: C.verdict},
]

const valueBlocks = [
  {
    who: '学生',
    title: '看清目标岗位，也知道下一步怎么做',
    body: '不是只给一次匹配判断，而是把目标岗位、真实 JD、建议与成长验证串成一条可执行路径。',
    accent: C.resolve,
  },
  {
    who: '高校',
    title: '把个性化就业指导从经验驱动变成数据驱动',
    body: '让画像、诊断、报告与成长档案可沉淀、可追踪，也更容易形成持续指导机制。',
    accent: C.scan,
  },
  {
    who: '机构',
    title: '形成可部署、可扩展、可持续更新的职业服务闭环',
    body: '不是单点工具，而是一套会持续跟进学生状态并不断更新建议的职业智能体体系。',
    accent: C.gapSharp,
  },
]

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame()
  const d = CTA_V2

  const titleP = progressBetween(frame, 0, 1.6 * FPS, easeOutExpo)
  const signalsP = progressBetween(frame, 0.4 * FPS, 3.4 * FPS, easeOutExpo)
  const identityP = progressBetween(frame, 2.4 * FPS, 5.8 * FPS, easeOutExpo)
  const valueP = progressBetween(frame, 5.2 * FPS, 10.4 * FPS, easeOutExpo)
  const finalP = progressBetween(frame, 10.2 * FPS, 13.4 * FPS, easeOutExpo)
  const drift = interpolate(frame, [0, d.duration * FPS], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{fontFamily: FONT.sans, overflow: 'hidden', background: BG.scan, color: C.white}}>
      <div style={{...screenVignette(0.3), zIndex: 1}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '170px 170px',
          opacity: 0.22,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 220 - drift * 26,
          top: 100,
          width: 720,
          height: 720,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,163,190,0.1) 0%, transparent 72%)',
          filter: 'blur(16px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 80 + drift * 12,
          bottom: 120 - drift * 18,
          width: 640,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,163,190,0.1) 0%, transparent 72%)',
          filter: 'blur(18px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          opacity: titleP,
        }}
      >
        <div style={sectionRailLine} />
        <div style={sectionEyebrowText}>系统终局</div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 72,
          top: 52,
          ...trailTag('scan'),
          fontSize: 12,
          opacity: titleP,
        }}
      >
        系统报告 → 价值落点 → 最终结论
      </div>

      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          top: 116,
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: 40,
          alignItems: 'start',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            opacity: signalsP * (1 - finalP * 0.35),
          }}
        >
          {traceSignals.map((item, index) => {
            const p = progressBetween(frame, 0.8 * FPS + index * 4, 3.6 * FPS + index * 4, easeOutExpo)
            return (
              <div
                key={item.label}
                style={{
                  position: 'relative',
                  padding: '14px 16px 13px',
                  borderLeft: `3px solid ${item.accent}`,
                  ...premiumPanel('scan'),
                  opacity: p,
                  transform: `translateX(${(1 - p) * -16}px)`,
                }}
              >
                <div style={panelTopLine('scan', 18)} />
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: item.accent,
                    fontFamily: FONT.mono,
                    letterSpacing: 1.4,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 18,
                    lineHeight: 1.16,
                    fontWeight: 800,
                    color: C.white,
                  }}
                >
                  {item.detail}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{position: 'relative', minHeight: 300}}>
          <div
            style={{
              opacity: identityP * (1 - finalP * 0.55),
              transform: `translateY(${(1 - identityP) * 20}px)`,
            }}
          >
            <div
              style={{
                position: 'relative',
                padding: '34px 36px 40px',
                minHeight: 250,
                ...premiumPanel('scan', true),
              }}
            >
              <div style={panelTopLine('scan')} />
              <div style={panelGlowOrb('scan', {right: -70, top: -90, size: 240, opacity: 0.2})} />
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: C.scan,
                  fontFamily: FONT.mono,
                  letterSpacing: 1.8,
                }}
              >
                系统定义
              </div>
              <div
                style={{
                  marginTop: 16,
                  fontSize: 86,
                  lineHeight: 0.92,
                  fontWeight: 900,
                  letterSpacing: -4,
                  color: C.white,
                }}
              >
                CareerOS
                <br />
                职业智能体
              </div>
              <div
                style={{
                  marginTop: 18,
                  maxWidth: 860,
                  fontSize: 22,
                  lineHeight: 1.55,
                  color: C.ink,
                  fontWeight: 600,
                }}
              >
                CareerOS 不只是在告诉学生能不能投，而是把目标选择、JD 判断、建议落地和成长验证，连成一条持续协作的职业决策路径。
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 54,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 18,
              opacity: valueP * (1 - finalP * 0.4),
            }}
          >
            {valueBlocks.map((item, index) => {
              const p = progressBetween(frame, 5.8 * FPS + index * 5, 9.8 * FPS + index * 5, easeOutExpo)
              return (
                <div
                  key={item.who}
                  style={{
                    position: 'relative',
                    minHeight: 260,
                    padding: '18px 18px 16px',
                    borderTop: `2px solid ${item.accent}`,
                    ...premiumPanel('scan'),
                    transform: `translateY(${(1 - p) * 18}px)`,
                    opacity: p,
                  }}
                >
                  <div style={panelTopLine('scan', 18)} />
                  <div
                    style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderLeft: `2px solid ${item.accent}`,
                      background: 'rgba(247,241,235,0.03)',
                      fontSize: 11,
                      fontWeight: 900,
                      color: item.accent,
                      fontFamily: FONT.mono,
                      letterSpacing: 1.2,
                    }}
                  >
                    {item.who}
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      fontSize: 32,
                      lineHeight: 1.06,
                      fontWeight: 900,
                      color: C.white,
                      letterSpacing: -1.4,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      fontSize: 15,
                      lineHeight: 1.64,
                      color: C.inkMuted,
                    }}
                  >
                    {item.body}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 116,
          display: 'flex',
          justifyContent: 'center',
          opacity: finalP,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 980,
            padding: '24px 30px 28px',
            textAlign: 'left',
            transform: `translateY(${(1 - finalP) * 18}px) scale(${0.985 + finalP * 0.015})`,
            ...premiumPanel('scan', true),
          }}
        >
          <div style={panelTopLine('scan')} />
          <div style={panelGlowOrb('scan', {right: -30, top: -80, size: 180, opacity: 0.14})} />
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: C.scan,
              fontFamily: FONT.mono,
              letterSpacing: 2,
            }}
          >
            系统结论
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 56,
              lineHeight: 1.02,
              fontWeight: 900,
              color: C.white,
              letterSpacing: -2.4,
            }}
          >
            CareerOS 不是一次匹配，
            <br />
            而是一条持续协作的职业决策路径。
          </div>
          <div
            style={{
              marginTop: 12,
              maxWidth: 760,
              fontSize: 16,
              lineHeight: 1.6,
              color: C.inkMuted,
            }}
          >
            {d.finalLine}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
