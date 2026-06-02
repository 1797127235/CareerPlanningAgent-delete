import './index.css'
import { Composition } from 'remotion'
import { CareerOSVideo, SceneDurations } from './Composition'
import { FPS } from './tokens'

const AUDIO_FILES = [
  { id: 'hook', file: 'audio/01-intro.mp3' },
  { id: 'profile', file: 'audio/02-profile.mp3' },
  { id: 'recommend', file: 'audio/03-recommend.mp3' },
  { id: 'jd-gap', file: 'audio/04-jd-gap.mp3' },
  { id: 'interview', file: 'audio/05-interview.mp3' },
  { id: 'growth', file: 'audio/06-growth.mp3' },
  { id: 'report', file: 'audio/07-report.mp3' },
  { id: 'cta', file: 'audio/08-outro.mp3' },
] as const

const measureDuration = (src: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      resolve(audio.duration)
    }
    audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`))
    audio.src = src
  })

const DEFAULT_DURATIONS: SceneDurations = {
  hook: 330,       // 01-intro: ~11.0s
  profile: 459,    // 02-profile: ~15.3s
  recommend: 354,  // 03-recommend: ~11.8s
  'jd-gap': 486,   // 04-jd-gap: ~16.2s
  interview: 423,  // 05-interview: ~14.1s
  growth: 462,     // 06-growth: ~15.4s
  report: 489,     // 07-report: ~16.3s
  cta: 444,        // 08-outro: ~14.8s
}

const DEFAULT_TOTAL = Object.values(DEFAULT_DURATIONS).reduce(
  (sum, d) => sum + d,
  0,
)

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CareerOS"
      component={CareerOSVideo}
      durationInFrames={DEFAULT_TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ durations: DEFAULT_DURATIONS }}
      calculateMetadata={async () => {
        const publicUrl =
          typeof window !== 'undefined' && window.remotion_staticBase
            ? window.remotion_staticBase
            : '/public'

        const durations = await AUDIO_FILES.reduce(
          async (accP, { id, file }) => {
            const acc = await accP
            try {
              const seconds = await measureDuration(`${publicUrl}/${file}`)
              acc[id] = Math.round(seconds * FPS)
            } catch {
              acc[id] = DEFAULT_DURATIONS[id]
            }
            return acc
          },
          Promise.resolve({} as SceneDurations),
        )

        const total = Object.values(durations).reduce(
          (sum, d) => sum + d,
          0,
        )

        return {
          durationInFrames: total,
          props: { durations },
        }
      }}
    />
  )
}
