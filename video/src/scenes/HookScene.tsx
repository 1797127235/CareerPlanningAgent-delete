import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'
import { C, FONT } from '../tokens'
import { BRAND, HOOK, STATS } from '../content'
import { Scene, NumberTicker, SpringFadeIn, SpringScaleIn, SPRING_POP, SPRING_BOUNCE, SPRING_SOFT } from '../components/Animations'

const HookScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const bgProgress = interpolate(frame, [0, 1.5 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })

  const circleSize = 600 + bgProgress * 400

  return (
    <Scene bg={C.bgDark}>
      <div
        style={{
          position: 'absolute',
          left: width / 2,
          top: height / 2,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          style={{
            width: circleSize,
            height: circleSize,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(107,62,46,0.15) 0%, transparent 70%)`,
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: height * 0.12,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <SpringFadeIn delay={0.3} duration={0.8} springConfig={SPRING_SOFT}>
          <div
            style={{
              fontSize: 18,
              color: C.accent,
              fontWeight: 600,
              letterSpacing: 4,
              fontFamily: FONT.sans,
            }}
          >
            {BRAND.name} · {BRAND.tagline}
          </div>
        </SpringFadeIn>
      </div>

      <div
        style={{
          position: 'absolute',
          top: height * 0.32,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 120px',
        }}
      >
        <SpringFadeIn delay={0.8} duration={1} springConfig={SPRING_POP}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: C.white,
              lineHeight: 1.3,
              fontFamily: FONT.sans,
            }}
          >
            {HOOK.headline}
          </div>
        </SpringFadeIn>

        <SpringFadeIn delay={1.8} duration={0.8} springConfig={SPRING_SOFT}>
          <div
            style={{
              fontSize: 20,
              color: C.inkMuted,
              marginTop: 24,
              lineHeight: 1.6,
              fontFamily: FONT.sans,
            }}
          >
            {HOOK.sub}
          </div>
        </SpringFadeIn>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: height * 0.12,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 60,
        }}
      >
        {STATS.map((stat, i) => (
          <SpringScaleIn key={i} delay={2.5 + i * 0.3} duration={0.8} from={0.5} springConfig={SPRING_POP}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: C.chestnutLight, fontFamily: FONT.sans }}>
                <NumberTicker value={stat.value} delay={2.5 + i * 0.3} duration={1.2} springConfig={SPRING_BOUNCE} />
              </div>
              <div style={{ fontSize: 14, color: C.inkMuted, marginTop: 4, fontFamily: FONT.sans }}>
                {stat.label}
              </div>
            </div>
          </SpringScaleIn>
        ))}
      </div>
    </Scene>
  )
}

export default HookScene
