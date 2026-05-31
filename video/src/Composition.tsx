import React from 'react'
import { Sequence, AbsoluteFill } from 'remotion'
import { FPS } from './tokens'
import { UPLOAD_PROFILE_DATA, GRAPH_JD_DATA, INTERVIEW_AI_DATA, GROWTH_DATA_V2, REPORT_DATA } from './content'
import HookScene from './scenes/HookScene'
import UploadProfileScene from './scenes/UploadProfileScene'
import GraphJDScene from './scenes/GraphJDScene'
import InterviewAIScene from './scenes/InterviewAIScene'
import GrowthScene from './scenes/GrowthScene'
import ReportScene from './scenes/ReportScene'
import CTAScene from './scenes/CTAScene'

const HOOK_DUR = 8
const UPLOAD_PROFILE_DUR = UPLOAD_PROFILE_DATA.duration
const GRAPH_JD_DUR = GRAPH_JD_DATA.duration
const INTERVIEW_AI_DUR = INTERVIEW_AI_DATA.duration
const GROWTH_DUR = GROWTH_DATA_V2.duration
const REPORT_DUR = REPORT_DATA.duration
const CTA_DUR = 10

export const TOTAL_DUR =
  (HOOK_DUR + UPLOAD_PROFILE_DUR + GRAPH_JD_DUR + INTERVIEW_AI_DUR + GROWTH_DUR + REPORT_DUR + CTA_DUR) * FPS

export const CareerOSVideo: React.FC = () => {
  const hookStart = 0
  const uploadProfileStart = hookStart + HOOK_DUR * FPS
  const graphJDStart = uploadProfileStart + UPLOAD_PROFILE_DUR * FPS
  const interviewAIStart = graphJDStart + GRAPH_JD_DUR * FPS
  const growthStart = interviewAIStart + INTERVIEW_AI_DUR * FPS
  const reportStart = growthStart + GROWTH_DUR * FPS
  const ctaStart = reportStart + REPORT_DUR * FPS

  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1714' }}>
      <Sequence from={hookStart} durationInFrames={HOOK_DUR * FPS}>
        <HookScene />
      </Sequence>
      <Sequence from={uploadProfileStart} durationInFrames={UPLOAD_PROFILE_DUR * FPS}>
        <UploadProfileScene />
      </Sequence>
      <Sequence from={graphJDStart} durationInFrames={GRAPH_JD_DUR * FPS}>
        <GraphJDScene />
      </Sequence>
      <Sequence from={interviewAIStart} durationInFrames={INTERVIEW_AI_DUR * FPS}>
        <InterviewAIScene />
      </Sequence>
      <Sequence from={growthStart} durationInFrames={GROWTH_DUR * FPS}>
        <GrowthScene />
      </Sequence>
      <Sequence from={reportStart} durationInFrames={REPORT_DUR * FPS}>
        <ReportScene />
      </Sequence>
      <Sequence from={ctaStart} durationInFrames={CTA_DUR * FPS}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  )
}
