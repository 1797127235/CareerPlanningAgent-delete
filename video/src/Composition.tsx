import React from 'react'
import { Audio, Sequence, staticFile } from 'remotion'
import { HookScene } from './scenes/HookScene'
import { UploadProfileScene } from './scenes/UploadProfileScene'
import { GraphPositioningAct, JdJudgmentAct } from './scenes/GraphJDScene'
import { InterviewAIScene } from './scenes/InterviewAIScene'
import { GrowthScene } from './scenes/GrowthScene'
import { ReportScene } from './scenes/ReportScene'
import { CTAScene } from './scenes/CTAScene'
// Each scene gets its own audio segment — no single merged track,
// no cumulative drift from MP3 concat or Math.ceil rounding.
const SCENES = [
  { id: 'hook', audio: 'audio/01-intro.mp3', Scene: HookScene },
  { id: 'profile', audio: 'audio/02-profile.mp3', Scene: UploadProfileScene },
  { id: 'recommend', audio: 'audio/03-recommend.mp3', Scene: GraphPositioningAct },
  { id: 'jd-gap', audio: 'audio/04-jd-gap.mp3', Scene: JdJudgmentAct },
  { id: 'interview', audio: 'audio/05-interview.mp3', Scene: InterviewAIScene },
  { id: 'growth', audio: 'audio/06-growth.mp3', Scene: GrowthScene },
  { id: 'report', audio: 'audio/07-report.mp3', Scene: ReportScene },
  { id: 'cta', audio: 'audio/08-outro.mp3', Scene: CTAScene },
] as const

export type SceneDurations = Record<string, number>

export const CareerOSVideo: React.FC<{ durations: SceneDurations }> = ({
  durations,
}) => {
  let cumulative = 0

  const sequences = SCENES.map(({ id, audio, Scene }) => {
    const from = cumulative
    const dur = durations[id]
    cumulative += dur
    return (
      <Sequence key={id} from={from} durationInFrames={dur}>
        <Audio src={staticFile(audio)} />
        <Scene />
      </Sequence>
    )
  })

  return <>{sequences}</>
}
