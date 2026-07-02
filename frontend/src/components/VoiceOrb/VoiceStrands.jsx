import Strands from '../ReactBits/Strands'

export default function VoiceStrands({ state = 'idle' }) {
  const isActive = state === 'listening' || state === 'speaking' || state === 'thinking'

  if (!isActive) return null

  const intensity = state === 'listening' ? 0.9 : state === 'speaking' ? 0.7 : 0.4
  const speed = state === 'listening' ? 0.8 : state === 'speaking' ? 0.5 : 0.3
  const count = state === 'listening' ? 6 : state === 'speaking' ? 5 : 4
  const waveAmp = state === 'listening' ? 1.6 : state === 'speaking' ? 1.3 : 0.9

  const rainbowColors = ['#FF4242', '#FF8C42', '#FAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899']

  return (
    <div className="w-[260px] h-[90px]">
      <Strands
        colors={rainbowColors}
        count={count}
        speed={speed}
        amplitude={waveAmp}
        waviness={2.5}
        thickness={0.9}
        glow={3.5}
        taper={5}
        spread={1.4}
        intensity={intensity}
        saturation={1.8}
        opacity={0.9}
        scale={1.4}
      />
    </div>
  )
}