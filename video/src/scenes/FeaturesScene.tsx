const SCENES: Array<{ id: string; title: string; desc: string; screenshot: string; duration: number }> = [
  { id: 'profile', title: '能力画像', desc: '简历解析 → 技能提取 → 职业定位', screenshot: 'profile.png', duration: 4 },
]

import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'
import { C } from '../tokens'
import { ScreenScene } from '../components/ScreenScene'

const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const transitionDur = 0.8

  let accumulated = 0
  let currentIdx = 0
  for (let i = 0; i < SCENES.length; i++) {
    const segEnd = accumulated + SCENES[i].duration
    if (frame / fps < segEnd) {
      currentIdx = i
      break
    }
    accumulated = segEnd
  }

  const sceneStartSec = SCENES.slice(0, currentIdx).reduce((acc, s) => acc + s.duration, 0)
  const localFrame = frame - sceneStartSec * fps

  const nextIdx = Math.min(currentIdx + 1, SCENES.length - 1)
  const isTransitioning = localFrame > (SCENES[currentIdx].duration - transitionDur) * fps && currentIdx < SCENES.length - 1

  const transProgress = isTransitioning
    ? interpolate(
        localFrame,
        [(SCENES[currentIdx].duration - transitionDur) * fps, SCENES[currentIdx].duration * fps],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }
      )
    : 0

  const currentOpacity = isTransitioning ? 1 - transProgress : 1
  const nextOpacity = isTransitioning ? transProgress : 0

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: C.bg }}>
      <div style={{ position: 'absolute', inset: 0, opacity: currentOpacity }}>
        <ScreenScene scene={SCENES[currentIdx]} sceneIndex={currentIdx} totalScenes={SCENES.length} />
      </div>
      {isTransitioning && (
        <div style={{ position: 'absolute', inset: 0, opacity: nextOpacity }}>
          <ScreenScene scene={SCENES[nextIdx]} sceneIndex={nextIdx} totalScenes={SCENES.length} />
        </div>
      )}
    </div>
  )
}

export default FeaturesScene
