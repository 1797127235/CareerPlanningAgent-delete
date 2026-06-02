import React from 'react'
import {AbsoluteFill, useCurrentFrame} from 'remotion'
import {INTERVIEW_AI_DATA} from '../content'
import {BG, C, FONT} from '../tokens'
import {progressBetween} from '../motion/cinematic'

const FPS = 30

const panelStyle: React.CSSProperties = {
  border: '1px solid rgba(107,163,190,0.1)',
  background: 'linear-gradient(180deg, rgba(16,22,32,0.84) 0%, rgba(11,16,24,0.78) 100%)',
  boxShadow: '0 26px 60px rgba(0,0,0,0.22), inset 0 0 32px rgba(107,163,190,0.03)',
  backdropFilter: 'blur(10px)',
}

const pillStyle: React.CSSProperties = {
  padding: '7px 10px',
  border: '1px solid rgba(107,163,190,0.12)',
  background: 'rgba(107,163,190,0.06)',
  fontSize: 11,
  fontWeight: 700,
  color: C.white,
}

function PanelHeader({label, title}: {label: string; title: string}) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
      <div style={{fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.08em', color: C.scan}}>
        {label}
      </div>
      <div style={{fontSize: 17, lineHeight: 1.35, fontWeight: 800, color: C.white}}>
        {title}
      </div>
    </div>
  )
}

export const InterviewAIScene: React.FC = () => {
  const frame = useCurrentFrame()
  const d = INTERVIEW_AI_DATA

  const titleP = progressBetween(frame, 0, 1.2 * FPS)
  const contextP = progressBetween(frame, 0.5 * FPS, 3 * FPS)
  const consoleP = progressBetween(frame, 2 * FPS, 5.5 * FPS)
  const answerP = progressBetween(frame, 4 * FPS, 7 * FPS)
  const followP = progressBetween(frame, 6 * FPS, 9.5 * FPS)
  const traceP = progressBetween(frame, 7.4 * FPS, 11.4 * FPS)
  const evalP = progressBetween(frame, 8 * FPS, 12 * FPS)
  const verdictP = progressBetween(frame, 10.5 * FPS, 15 * FPS)

  return (
    <AbsoluteFill style={{background: BG.scan, fontFamily: FONT.sans}}>
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 60px',
          borderBottom: '1px solid rgba(107,163,190,0.08)',
        }}
      >
        <div style={{fontFamily: FONT.mono, fontSize: 11, color: C.scan, letterSpacing: '0.06em', opacity: 0.82}}>
          面试验证
        </div>
        <div style={{fontFamily: FONT.mono, fontSize: 10, color: C.inkMuted, letterSpacing: '0.06em'}}>
          画像信号 → 目标 JD → 关键缺口 → 面试验证
        </div>
      </div>

      <div style={{padding: '34px 60px 40px', height: 'calc(100% - 52px)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32}}>
          <div style={{opacity: titleP, maxWidth: 740}}>
            <div style={{fontFamily: FONT.mono, fontSize: 11, color: C.scan, letterSpacing: '0.08em', marginBottom: 10}}>
              面试验证
            </div>
            <div style={{fontSize: 58, lineHeight: 1.02, fontWeight: 900, color: C.white, letterSpacing: '-0.04em'}}>
              {d.title}
            </div>
            <div style={{marginTop: 14, fontSize: 16, lineHeight: 1.7, color: C.inkMuted, maxWidth: 760}}>
              {d.sub}
            </div>
          </div>

          <div
            style={{
              ...panelStyle,
              width: 330,
              padding: '18px 20px',
              opacity: contextP,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: C.scan,
                  boxShadow: `0 0 12px ${C.scanGlow}`,
                }}
              />
              <div style={{fontFamily: FONT.mono, fontSize: 11, fontWeight: 900, color: C.scan, letterSpacing: 1.4}}>
                CareerOS 智能体
              </div>
            </div>
            <div style={{marginTop: 12, fontSize: 21, lineHeight: 1.35, fontWeight: 800, color: C.white}}>
              CareerOS 不会随机出题，而是围绕前面的真实证据继续追问。
            </div>
            <div style={{marginTop: 10, fontSize: 13, lineHeight: 1.6, color: C.inkMuted}}>
              这一轮要验证的不是“会不会背题”，而是建议有没有真正转化成面试表达能力。
            </div>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '350px 1fr 330px', gap: 24, marginTop: 28, height: 600}}>
          <div
            style={{
              ...panelStyle,
              padding: '22px 22px 18px',
              opacity: contextP,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <PanelHeader label="本轮验证依据" title="智能体读取的是上下文，不是通用题库分类。" />
            <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12}}>
              {d.contextSignals.map((item, index) => (
                <div
                  key={item.label}
                  style={{
                    padding: '14px 14px 13px',
                    border: '1px solid rgba(107,163,190,0.08)',
                    background: index === 1 ? 'rgba(107,163,190,0.05)' : 'rgba(247,241,235,0.02)',
                  }}
                >
                  <div style={{fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em', color: C.scan, marginBottom: 7}}>
                    {item.label}
                  </div>
                  <div style={{fontSize: 14, lineHeight: 1.55, color: C.white}}>
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 14,
                flex: 1,
                display: 'grid',
                gridTemplateRows: '1fr auto',
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: '14px 14px 12px',
                  border: '1px solid rgba(107,163,190,0.08)',
                  background: 'linear-gradient(180deg, rgba(107,163,190,0.04) 0%, rgba(107,163,190,0.015) 100%)',
                }}
              >
                <div style={{fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em', color: C.scan, marginBottom: 8}}>
                  追问锚点
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                  {['用项目细节证明优化是真实发生的', '用具体例子讲清性能变化前后的差别'].map((item) => (
                    <div key={item} style={{display: 'flex', gap: 10, alignItems: 'flex-start'}}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          marginTop: 6,
                          borderRadius: '50%',
                          backgroundColor: C.scan,
                          boxShadow: `0 0 10px ${C.scanGlow}`,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{fontSize: 13, lineHeight: 1.6, color: C.white}}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  padding: '12px 14px 11px',
                  border: '1px solid rgba(247,241,235,0.06)',
                  background: 'rgba(247,241,235,0.02)',
                }}
              >
                <div style={{fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em', color: C.chestnut, marginBottom: 7}}>
                  本轮验证目标
                </div>
                <div style={{fontSize: 13, lineHeight: 1.6, color: C.inkMuted}}>
                  把前面识别出的优化经历、系统表达和能力缺口，转化成可以继续追问的面试证据。
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              ...panelStyle,
              padding: '20px 22px 18px',
              position: 'relative',
              overflow: 'hidden',
              opacity: consoleP,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(107,163,190,0.06) 0%, rgba(107,163,190,0) 34%), radial-gradient(circle at 50% 0%, rgba(107,163,190,0.12), transparent 46%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100%'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20}}>
                <PanelHeader label="个性化面试控制台" title="本轮问题已按前序画像、JD 与缺口重新组织" />
                <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, maxWidth: 300}}>
                  {['画像', '目标 JD', '关键缺口', '历史复盘'].map((tag) => (
                    <div key={tag} style={pillStyle}>
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: 22,
                  padding: '18px 18px 16px',
                  borderLeft: `2px solid ${C.scan}`,
                  background: 'rgba(247,241,235,0.02)',
                }}
              >
                <div style={{fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em', color: C.scan, marginBottom: 10}}>
                  问题投放
                </div>
                <div style={{fontSize: 23, lineHeight: 1.55, fontWeight: 700, color: C.white}}>
                  {d.question}
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  padding: '16px 18px',
                  border: '1px solid rgba(143,191,127,0.12)',
                  background: 'rgba(143,191,127,0.06)',
                  opacity: answerP,
                }}
              >
                <div style={{fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em', color: C.hit, marginBottom: 9}}>
                  候选回答
                </div>
                <div style={{fontSize: 15, lineHeight: 1.68, color: C.ink}}>
                  {d.answer}
                </div>
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: '16px 18px',
                  border: '1px solid rgba(232,151,79,0.16)',
                  background: 'rgba(232,151,79,0.08)',
                  opacity: followP,
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9}}>
                  <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: C.gapSharp, boxShadow: `0 0 12px ${C.gapSharp}`}} />
                  <div style={{fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em', color: C.gapSharp}}>
                    动态追问关键缺口
                  </div>
                </div>
                <div style={{fontSize: 16, lineHeight: 1.6, color: C.white}}>
                  {d.followUp}
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  paddingTop: 18,
                  borderTop: '1px solid rgba(107,163,190,0.08)',
                  opacity: traceP,
                }}
              >
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12}}>
                  {d.checks.map((item, index) => (
                    <div
                      key={item.label}
                      style={{
                        padding: '14px 14px 12px',
                        border: '1px solid rgba(107,163,190,0.08)',
                        background: 'rgba(247,241,235,0.02)',
                      }}
                    >
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10}}>
                        <div style={{fontSize: 12, fontWeight: 900, color: C.white}}>
                          {item.label}
                        </div>
                        <div
                          style={{
                            padding: '4px 7px',
                            background: index === 1 ? 'rgba(232,151,79,0.12)' : 'rgba(143,191,127,0.12)',
                            color: index === 1 ? C.gapSharp : C.hit,
                            fontFamily: FONT.mono,
                            fontSize: 10,
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.status}
                        </div>
                      </div>
                      <div style={{marginTop: 8, fontSize: 12, lineHeight: 1.55, color: C.inkMuted}}>
                        {item.detail}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    padding: '14px 14px 12px',
                    border: '1px solid rgba(107,163,190,0.08)',
                    background: 'linear-gradient(180deg, rgba(107,163,190,0.04) 0%, rgba(107,163,190,0.015) 100%)',
                  }}
                >
                  <div style={{fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em', color: C.scan, marginBottom: 10}}>
                    本轮验证流
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10}}>
                    {['问题投放', '候选回答', '动态追问', '结果回写成长手札'].map((step, index) => (
                      <div key={step} style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: index < 3 ? C.scan : C.resolve,
                            boxShadow: index < 3 ? `0 0 10px ${C.scanGlow}` : `0 0 10px ${C.resolve}`,
                            flexShrink: 0,
                          }}
                        />
                        <div style={{fontSize: 12, lineHeight: 1.45, color: C.white}}>
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
            <div
              style={{
                ...panelStyle,
                padding: '20px 20px 18px',
                opacity: evalP,
              }}
            >
              <PanelHeader label="验证进展" title="智能体判断的不是会不会，而是有没有开始转化。" />
              <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14}}>
                {d.checks.map((item, index) => (
                  <div
                    key={item.label}
                    style={{
                      paddingBottom: index === d.checks.length - 1 ? 0 : 14,
                      borderBottom: index === d.checks.length - 1 ? 'none' : '1px solid rgba(247,241,235,0.06)',
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center'}}>
                      <div style={{fontSize: 16, fontWeight: 800, color: C.white}}>{item.label}</div>
                      <div
                        style={{
                          padding: '5px 8px',
                          background: index === 1 ? 'rgba(232,151,79,0.12)' : 'rgba(143,191,127,0.12)',
                          color: index === 1 ? C.gapSharp : C.hit,
                          fontFamily: FONT.mono,
                          fontSize: 10,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {item.status}
                      </div>
                    </div>
                    <div style={{marginTop: 8, fontSize: 13, lineHeight: 1.55, color: C.inkMuted}}>
                      {item.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                ...panelStyle,
                padding: '20px 20px 18px',
                opacity: verdictP,
              }}
            >
              <PanelHeader label="本轮结论" title={d.verdictTitle} />
              <div style={{marginTop: 12, fontSize: 14, lineHeight: 1.65, color: C.inkMuted}}>
                {d.verdictBody}
              </div>
              <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10}}>
                {d.nextActions.map((item, index) => (
                  <div
                    key={item}
                    style={{
                      padding: '12px 12px 11px',
                      borderLeft: `2px solid ${index === 2 ? C.scan : C.resolve}`,
                      background: 'rgba(247,241,235,0.02)',
                      color: C.white,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div style={{marginTop: 14, fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em', color: C.scan}}>
                面试结果将继续回流到成长手札
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
