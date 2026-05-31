import './index.css'
import { Composition } from 'remotion'
import { CareerOSVideo, TOTAL_DUR } from './Composition'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CareerOS"
        component={CareerOSVideo}
        durationInFrames={TOTAL_DUR}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  )
}
