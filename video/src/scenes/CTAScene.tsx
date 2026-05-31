import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { C, FONT } from '../tokens'
import { CTA_V2 } from '../content'
import { Scene, FadeIn } from '../components/Animations'

const CTAScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const glowSize = interpolate(frame, [0, 8 * fps], [400, 900], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const glowOpacity = interpolate(frame, [0, 2 * fps], [0, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <Scene bg={C.bgDark}>
      <div
        style={{
          position: 'absolute',
          left: width / 2 - glowSize / 2,
          top: height / 2 - glowSize / 2,
          width: glowSize,
          height: glowSize,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(184,92,56,${glowOpacity}) 0%, transparent 70%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <FadeIn delay={0.3} duration={1}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: C.white,
              textAlign: 'center',
              lineHeight: 1.3,
              fontFamily: FONT.sans,
            }}
          >
            {CTA_V2.headline}
          </div>
        </FadeIn>

        <FadeIn delay={1.2} duration={0.8}>
          <div
            style={{
              fontSize: 20,
              color: C.inkMuted,
              textAlign: 'center',
              fontFamily: FONT.sans,
            }}
          >
            {CTA_V2.sub}
          </div>
        </FadeIn>

        <FadeIn delay={1.8} duration={0.8}>
          <div
            style={{
              marginTop: 20,
              padding: '14px 40px',
              borderRadius: 8,
              backgroundColor: C.chestnut,
              color: C.white,
              fontSize: 18,
              fontWeight: 600,
              fontFamily: FONT.sans,
            }}
          >
            {CTA_V2.url}
          </div>
        </FadeIn>

        <FadeIn delay={2.5} duration={0.6}>
          <div
            style={{
              marginTop: 40,
              fontSize: 14,
              color: C.inkMuted,
              letterSpacing: 3,
              fontFamily: FONT.sans,
            }}
          >
            THANK YOU
          </div>
        </FadeIn>
      </div>
    </Scene>
  )
}

export default CTAScene
