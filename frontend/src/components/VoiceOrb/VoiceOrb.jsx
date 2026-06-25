import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STATES = {
  idle: { label: 'IDLE', color: '#5ed29c', pulseSpeed: 3 },
  listening: { label: 'LISTENING', color: '#5ed29c', pulseSpeed: 0.8 },
  thinking: { label: 'THINKING', color: '#a78bfa', pulseSpeed: 1.5 },
  speaking: { label: 'SPEAKING', color: '#60a5fa', pulseSpeed: 0.4 },
}

export default function VoiceOrb({ state = 'idle', audioLevel = 0 }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const [time, setTime] = useState(0)

  const config = STATES[state] || STATES.idle

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let start = Date.now()
    let running = true

    const draw = () => {
      if (!running) return
      const elapsed = (Date.now() - start) / 1000
      setTime(elapsed)

      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const maxR = Math.min(w, h) * 0.4

      ctx.clearRect(0, 0, w, h)

      // Glow rings
      for (let i = 0; i < 3; i++) {
        const phase = (elapsed * (config.pulseSpeed * 0.5) + i * 2.1) % (Math.PI * 2)
        const r = maxR * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(phase)))
        const alpha = 0.15 * (1 - i * 0.25) * (0.6 + 0.4 * Math.sin(phase * 0.7))

        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = config.color
        ctx.globalAlpha = alpha
        ctx.lineWidth = 1.5 - i * 0.3
        ctx.stroke()
      }

      // Core orb with pulse
      const pulseScale = 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(elapsed * config.pulseSpeed))
      const coreR = maxR * 0.25 * pulseScale

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2)
      grad.addColorStop(0, config.color)
      grad.addColorStop(0.5, config.color + '66')
      grad.addColorStop(1, config.color + '00')

      ctx.beginPath()
      ctx.arc(cx, cy, coreR * 2, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.globalAlpha = 0.3
      ctx.fill()

      ctx.beginPath()
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
      ctx.fillStyle = config.color
      ctx.globalAlpha = 0.9
      ctx.fill()

      // Waveform bars (listening / speaking)
      if (state === 'listening' || state === 'speaking') {
        const nBars = 32
        const barW = 2
        const spread = maxR * 1.4
        const baseH = state === 'speaking' ? 20 : 12
        const maxH = state === 'speaking' ? 50 : 30

        for (let i = 0; i < nBars; i++) {
          const angle = (i / nBars) * Math.PI * 2 - Math.PI / 2
          const barPhase = elapsed * (state === 'speaking' ? 6 : 4) + i * 0.3
          const audioMod = audioLevel > 0 ? audioLevel * 2 : 0.5 + 0.5 * Math.sin(barPhase)
          const barH = baseH + maxH * audioMod * Math.sin((i / nBars) * Math.PI) ** 2

          const baseR = maxR * 0.55
          const x1 = cx + Math.cos(angle) * (baseR - barH * 0.3)
          const y1 = cy + Math.sin(angle) * (baseR - barH * 0.3)

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(
            cx + Math.cos(angle) * (baseR + barH * 0.7),
            cy + Math.sin(angle) * (baseR + barH * 0.7)
          )
          ctx.strokeStyle = config.color
          ctx.globalAlpha = 0.4 + 0.4 * audioMod
          ctx.lineWidth = barW
          ctx.lineCap = 'round'
          ctx.stroke()
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      running = false
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [state, config, audioLevel])

  const size = 200

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        className="w-[200px] h-[200px]"
        style={{ filter: 'url(#glow)' }}
      />
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-[11px] font-bold tracking-widest mt-3"
          style={{ color: config.color }}
        >
          {config.label}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
