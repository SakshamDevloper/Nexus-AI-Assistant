import { useEffect, useRef } from 'react'

export default function VoiceOrb({ state = 'idle', accent = '#5ed29c' }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let running = true

    const resize = () => {
      const size = Math.min(window.innerWidth * 0.5, 240)
      canvas.width = size
      canvas.height = size
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      if (!running) return
      timeRef.current += 0.02

      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const radius = w * 0.3

      ctx.clearRect(0, 0, w, h)

      const intensity = state === 'listening' ? 1 : state === 'speaking' ? 0.8 : state === 'thinking' ? 0.5 : 0.2
      const pulse = state === 'listening' ? Math.sin(timeRef.current * 3) * 0.15 : 0

      // Parse accent color to RGB
      let r = 94, g = 210, b = 156
      if (accent.startsWith('#')) {
        const hex = accent.replace('#', '')
        r = parseInt(hex.slice(0, 2), 16) || 94
        g = parseInt(hex.slice(2, 4), 16) || 210
        b = parseInt(hex.slice(4, 6), 16) || 156
      }

      // Outer glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.8)
      grad.addColorStop(0, `rgba(${r},${g},${b},${0.12 * intensity})`)
      grad.addColorStop(0.5, `rgba(${r},${g},${b},${0.05 * intensity})`)
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Waveform rings
      const rings = state === 'idle' ? 2 : state === 'listening' ? 5 : state === 'speaking' ? 4 : 3
      for (let i = 0; i < rings; i++) {
        const phase = timeRef.current * 2 + i * 1.2
        const waveRadius = radius * (0.5 + i * 0.25) + Math.sin(phase) * (8 * intensity)
        const alpha = (0.3 - i * 0.06) * intensity

        ctx.beginPath()
        ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Center dot
      const dotRadius = (4 + pulse * 16) * intensity + 2
      ctx.beginPath()
      ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r},${g},${b},${0.4 + 0.3 * intensity})`
      ctx.fill()

      // Center glow
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.6)
      innerGrad.addColorStop(0, `rgba(${r},${g},${b},${0.08 * intensity})`)
      innerGrad.addColorStop(1, `rgba(${r},${g},${b},0)`)
      ctx.fillStyle = innerGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2)
      ctx.fill()

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      running = false
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [state, accent])

  const stateLabel = state === 'listening' ? 'Listening...' : state === 'speaking' ? 'Speaking...' : state === 'thinking' ? 'Thinking...' : ''

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="rounded-full"
        style={{ width: 'min(50vw, 240px)', height: 'min(50vw, 240px)' }}
      />
      {stateLabel && (
        <span className="absolute bottom-0 text-xs text-white/30 animate-fade-in mt-2">{stateLabel}</span>
      )}
    </div>
  )
}
