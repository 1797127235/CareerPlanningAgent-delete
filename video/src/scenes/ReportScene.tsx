import React from 'react'
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion'
import {REPORT_DATA} from '../content'
import {BG, C, FONT} from '../tokens'
import {easeOutExpo, progressBetween} from '../motion/cinematic'
import {
  panelGlowOrb,
  panelTopLine,
  premiumPanel,
  screenVignette,
  sectionEyebrowText,
  sectionRailLine,
  sectionSubtitleText,
  sectionTitleText,
  trailTag,
} from '../visualSystem'

const FPS = 30

const sourceSignals = [
  {
    label: '成长手札',
    detail: '学习记录 / 项目快照 / 面试复盘',
    color: C.resolve,
  },
  {
    label: '目标岗位',
    detail: '前端开发工程师 / 冲刺方向已确定',
    color: C.scan,
  },
  {
    label: '真实 JD',
    detail: '关键要求已拆解 / 差距已判断',
    color: C.gapSharp,
  },
  {
    label: '模拟面试',
    detail: '表达能力开始转化 / 追问结果已回流',
    color: C.hit,
  },
]

const summaryBlocks = [
  {
    label: '当前判断',
    title: '可以开始冲刺目标岗位',
    body: '前端项目深度与基础能力已经能支撑投递，但系统设计、SSR 与量化表达仍是决定上限的关键。 ',
    color: C.verdict,
  },
  {
    label: '报告重点',
    title: '不是再看一遍结果，而是收束成可执行路径',
    body: '前面的画像、JD、面试和成长手札都被压缩成一份下一阶段策略，避免建议停留在“知道差距”。',
    color: C.scan,
  },
]

const actionCards = [
  {
    index: '01',
    title: '补一条可量化的性能成果',
    body: '把白板项目里的优化结果写成可复述的证据，准备在下一轮面试里直接使用。',
    accent: C.resolve,
  },
  {
    index: '02',
    title: '补齐系统设计与 SSR 结构表达',
    body: '先把薄弱点整理成一页自己的知识框架，再回到目标 JD 对照表达方式。',
    accent: C.gapSharp,
  },
  {
    index: '03',
    title: '带着建议再做一轮模拟面试',
    body: '让智能体继续围绕关键缺口追问，确认建议是否真的转化成可验证的面试能力。',
    accent: C.scan,
  },
]

export const ReportScene: React.FC = () => {
  const frame = useCurrentFrame()
  const drift = interpolate(frame, [0, REPORT_DATA.duration * FPS], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const titleP = progressBetween(frame, 0, 1.2 * FPS, easeOutExpo)
  const sourceP = progressBetween(frame, 0.6 * FPS, 3.4 * FPS, easeOutExpo)
  const reportP = progressBetween(frame, 2.2 * FPS, 5.6 * FPS, easeOutExpo)
  const summaryP = progressBetween(frame, 4.2 * FPS, 7.2 * FPS, easeOutExpo)
  const actionP = progressBetween(frame, 6.4 * FPS, 10.5 * FPS, easeOutExpo)
  const closeP = progressBetween(frame, 9.2 * FPS, 11.6 * FPS, easeOutExpo)

  return (
    <AbsoluteFill
      style={{
        background: BG.scan,
        color: C.white,
        fontFamily: FONT.sans,
        overflow: 'hidden',
      }}
    >
      <div style={{...screenVignette(0.32), zIndex: 1}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '160px 160px',
          opacity: 0.24,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 820 - drift * 40,
          top: 140 + drift * 18,
          width: 760,
          height: 760,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,163,190,0.14) 0%, rgba(107,163,190,0.04) 34%, transparent 70%)',
          filter: 'blur(22px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -120,
          top: 420 - drift * 18,
          width: 680,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,163,190,0.1) 0%, transparent 72%)',
          filter: 'blur(24px)',
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
        <div style={{...sectionRailLine, backgroundColor: C.scan, boxShadow: `0 0 14px ${C.scanGlow}`}} />
        <div style={{...sectionEyebrowText, color: C.scan}}>职业发展报告</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 90,
          width: 720,
          opacity: titleP,
        }}
      >
        <div style={sectionTitleText(true)}>
          把成长手札
          <br />
          收束成下一阶段报告
        </div>
        <div style={{...sectionSubtitleText, marginTop: 16, maxWidth: 620, fontSize: 17, lineHeight: 1.65}}>
          不再只是展示前面的分析结果，而是把画像、目标岗位、真实 JD、模拟面试与成长记录重新整理成一份可执行的职业路径。
        </div>
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
        成长手札 → 报告收束 → 下一阶段行动
      </div>

      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 276,
          width: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          opacity: sourceP,
        }}
      >
        {sourceSignals.map((item, index) => {
          const p = progressBetween(frame, 1 * FPS + index * 4, 4.2 * FPS + index * 4, easeOutExpo)
          return (
            <div
              key={item.label}
              style={{
                position: 'relative',
                padding: '18px 18px 16px',
                ...premiumPanel('scan'),
                transform: `translateX(${(1 - p) * -18}px) translateY(${(1 - p) * 10}px) scale(${1 - (1 - p) * 0.03})`,
                opacity: p,
                boxShadow: '0 18px 40px rgba(0,0,0,0.16)',
              }}
            >
              <div style={panelTopLine('scan', 18)} />
              <div
                style={{
                  position: 'absolute',
                  right: -540,
                  top: '50%',
                  width: 520,
                  height: 1,
                  background: `linear-gradient(90deg, ${item.color} 0%, rgba(247,241,235,0.03) 100%)`,
                  boxShadow: `0 0 14px ${item.color}`,
                  opacity: reportP * 0.7,
                }}
              />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: item.color,
                  fontFamily: FONT.mono,
                  letterSpacing: 1.4,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 20,
                  lineHeight: 1.18,
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

      <div
        style={{
          position: 'absolute',
          left: 560,
          top: 252,
          width: 940,
          height: 520,
          opacity: reportP,
          transform: `translateY(${(1 - reportP) * 24}px) scale(${0.95 + reportP * 0.05})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 20,
            border: '1px solid rgba(247,241,235,0.05)',
            background: 'rgba(12,16,24,0.5)',
            boxShadow: '0 28px 80px rgba(0,0,0,0.28)',
            transform: `translate(${18 - reportP * 18}px, ${18 - reportP * 18}px)`,
            opacity: 0.34,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 10,
            border: '1px solid rgba(247,241,235,0.06)',
            background: 'rgba(14,18,26,0.72)',
            boxShadow: '0 26px 70px rgba(0,0,0,0.3)',
            transform: `translate(${8 - reportP * 8}px, ${8 - reportP * 8}px)`,
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '28px 32px 30px',
            ...premiumPanel('scan', true),
            boxShadow: '0 34px 90px rgba(0,0,0,0.34), inset 0 0 40px rgba(107,163,190,0.04)',
            overflow: 'hidden',
          }}
        >
          <div style={panelTopLine('scan')} />
          <div style={panelGlowOrb('scan', {size: 300, right: -92, top: -96, opacity: 0.16})} />
          <div
            style={{
              position: 'absolute',
              right: -120,
              top: -120,
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(107,163,190,0.16) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              position: 'relative',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: C.scan,
                  fontFamily: FONT.mono,
                  letterSpacing: 1.6,
                }}
              >
                系统终局报告
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 64,
                  lineHeight: 0.96,
                  fontWeight: 900,
                  letterSpacing: -3.2,
                  color: C.white,
                }}
              >
                目标岗位可冲刺，
                <br />
                还差 3 个关键动作
              </div>
              <div
                style={{
                  marginTop: 16,
                  maxWidth: 560,
                  fontSize: 16,
                  lineHeight: 1.64,
                  color: C.inkMuted,
                }}
              >
                智能体已经把前面的成长手札、真实 JD、面试验证与历史记录重新整理成一份真正可执行的阶段报告。
              </div>
            </div>
            <div
              style={{
                width: 232,
                padding: '16px 16px 14px',
                ...premiumPanel('scan'),
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: C.scan,
                  fontFamily: FONT.mono,
                  letterSpacing: 1.4,
                }}
              >
                报告摘要
              </div>
              <div style={{marginTop: 10, display: 'flex', flexDirection: 'column', gap: 9}}>
                {['画像已成形', '目标岗位已确定', '真实 JD 已诊断', '模拟面试已验证'].map((line, index) => (
                  <div
                    key={line}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: 9,
                      borderBottom: index === 3 ? 'none' : '1px solid rgba(247,241,235,0.06)',
                      fontSize: 13,
                      color: C.ink,
                    }}
                  >
                    <span>{line}</span>
                    <span style={{color: C.hit, fontFamily: FONT.mono, fontSize: 10}}>已收束</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 28,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 18,
              position: 'relative',
              opacity: summaryP,
            }}
          >
            {summaryBlocks.map((item) => (
              <div
                key={item.label}
                style={{
                  minHeight: 176,
                  padding: '20px 20px 18px',
                  ...premiumPanel(item.color === C.scan ? 'scan' : 'verdict'),
                }}
              >
                <div style={panelTopLine(item.color === C.scan ? 'scan' : 'verdict', 20)} />
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: item.color,
                    fontFamily: FONT.mono,
                    letterSpacing: 1.4,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 30,
                    lineHeight: 1.08,
                    fontWeight: 900,
                    color: C.white,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 15,
                    lineHeight: 1.62,
                    color: C.inkMuted,
                  }}
                >
                  {item.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          bottom: 120,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 20,
          opacity: actionP,
          transform: `translateY(${(1 - actionP) * 24}px)`,
        }}
      >
        {actionCards.map((item, index) => {
          const p = progressBetween(frame, 7.1 * FPS + index * 5, 10.2 * FPS + index * 5, easeOutExpo)
          return (
            <div
              key={item.index}
              style={{
                minHeight: 216,
                padding: '22px 22px 20px',
                ...premiumPanel(index === 1 ? 'gap' : index === 0 ? 'resolve' : 'scan'),
                borderTop: `2px solid ${item.accent}`,
                boxShadow: '0 18px 50px rgba(0,0,0,0.16)',
                transform: `translateY(${(1 - p) * 18}px)`,
                opacity: p,
              }}
            >
              <div style={panelTopLine(index === 1 ? 'gap' : index === 0 ? 'resolve' : 'scan', 22)} />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: item.accent,
                  fontFamily: FONT.mono,
                  letterSpacing: 1.6,
                }}
              >
                NEXT {item.index}
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 34,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: C.white,
                  letterSpacing: -1.2,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 15,
                  lineHeight: 1.62,
                  color: C.inkMuted,
                }}
              >
                {item.body}
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 40,
          textAlign: 'center',
          opacity: closeP,
        }}
      >
        <div
          style={{
            fontSize: 31,
            lineHeight: 1.2,
            fontWeight: 800,
            color: C.verdict,
            letterSpacing: -0.8,
          }}
        >
          {REPORT_DATA.finalLine}
        </div>
      </div>
    </AbsoluteFill>
  )
}
