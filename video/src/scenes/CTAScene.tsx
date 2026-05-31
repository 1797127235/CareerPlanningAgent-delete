import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { C, FONT } from '../tokens'
import { CTA_V2 } from '../content'
import { Scene, SpringFadeIn, SpringScaleIn, SPRING_BOUNCE, SPRING_POP, SPRING_SOFT, getSpringProgress } from '../components/Animations'

const CTAScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const glowProgress = getSpringProgress(frame, fps, 0, 3, SPRING_SOFT)
  const glowSize = 400 + glowProgress * 500
  const glowOpacity = glowProgress * 0.2

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
        <SpringScaleIn delay={0.3} duration={1.5} from={0.5} springConfig={SPRING_BOUNCE}>
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
        </SpringScaleIn>

        <SpringFadeIn delay={1.2} duration={0.8} springConfig={SPRING_POP}>
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
        </SpringFadeIn>

        <SpringScaleIn delay={1.8} duration={0.8} from={0.8} springConfig={SPRING_POP}>
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
        </SpringScaleIn>

        <SpringFadeIn delay={2.5} duration={0.6} springConfig={SPRING_SOFT}>
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
        </SpringFadeIn>
      </div>
    </Scene>
  )
}

export default CTAScene
