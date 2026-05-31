import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from 'remotion'
import { C, FONT } from '../tokens'
import { BrowserFrame } from './BrowserFrame'
import { Cursor } from './Cursor'
import { FadeIn } from './Animations'

interface SceneDef {
  id: string
  title: string
  desc: string
  screenshot: string
  duration: number
}

export const ScreenScene: React.FC<{
  scene: SceneDef
  sceneIndex: number
  totalScenes: number
  globalOffset?: number
}> = ({ scene, sceneIndex, totalScenes, globalOffset = 0 }) => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  const browserW = Math.min(1200, width * 0.78)
  const browserH = Math.min(680, height * 0.72)

  const cursorWaypoints = [
    { x: 150, y: 200, frame: 15 },
    { x: 350, y: 300, frame: 45, click: true },
    { x: 700, y: 400, frame: 80, click: true },
    { x: 900, y: 250, frame: 110, click: true },
    { x: 600, y: 500, frame: 130 },
  ]

  const screenshotOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.bg,
        gap: 30,
        fontFamily: FONT.sans,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <FadeIn delay={0}>
          <div
            style={{
              fontSize: 14,
              color: C.chestnut,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            0{sceneIndex + 1}
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.ink }}>{scene.title}</div>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div style={{ fontSize: 16, color: C.ink2, marginLeft: 8 }}>{scene.desc}</div>
        </FadeIn>
      </div>

      <div style={{ position: 'relative' }}>
        <BrowserFrame width={browserW} height={browserH} delay={0.3}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Img
              src={staticFile(`screenshots/${scene.screenshot}`)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top left',
                opacity: screenshotOpacity,
              }}
            />
            <Cursor waypoints={cursorWaypoints} size={18} />
          </div>
        </BrowserFrame>
      </div>

      <FadeIn delay={0.6}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
          }}
        >
          {Array.from({ length: totalScenes }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === sceneIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === sceneIndex ? C.chestnut : C.line,
                transition: 'none',
              }}
            />
          ))}
        </div>
      </FadeIn>
    </div>
  )
}
