import { useEffect, useRef, useState, useMemo } from 'react'

const DEFAULT_CONFIG = {
  position: 'bottom',
  strength: 2,
  height: '6rem',
  divCount: 5,
  exponential: false,
  zIndex: 1000,
  animated: false,
  duration: '0.3s',
  easing: 'ease-out',
  opacity: 1,
  curve: 'linear',
  responsive: false,
  target: 'parent',
  className: '',
  style: {}
}

const PRESETS = {
  top: { position: 'top', height: '6rem' },
  bottom: { position: 'bottom', height: '6rem' },
  left: { position: 'left', height: '6rem' },
  right: { position: 'right', height: '6rem' },
  subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
  intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
  smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
  sharp: { height: '5rem', curve: 'linear', divCount: 4 },
  header: { position: 'top', height: '8rem', curve: 'ease-out' },
  footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
  sidebar: { position: 'left', height: '6rem', strength: 2.5 },
  'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
  'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3 }
}

const CURVE_FUNCTIONS = {
  linear: p => p,
  bezier: p => p * p * (3 - 2 * p),
  'ease-in': p => p * p,
  'ease-out': p => 1 - Math.pow(1 - p, 2),
  'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
}

const mergeConfigs = (...configs) => configs.reduce((acc, config) => ({ ...acc, ...config }), {})

const getGradientDirection = (position) => {
  const directions = { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' }
  return directions[position] || 'to bottom'
}

const GradualBlur = (props) => {
  const containerRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(!(props.animated === 'scroll' || props.animated === true))

  const config = useMemo(() => {
    const presetConfig = props.preset && PRESETS[props.preset] ? PRESETS[props.preset] : {}
    return { ...DEFAULT_CONFIG, ...presetConfig, ...props }
  }, [props])

  useEffect(() => {
    if (config.animated !== 'scroll' || !containerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [config.animated])

  useEffect(() => {
    if (config.animated === true) {
      setIsVisible(true)
    }
  }, [config.animated])

  const blurDivs = useMemo(() => {
    const divs = []
    const increment = 100 / config.divCount
    const currentStrength = isHovered && config.hoverIntensity ? config.strength * config.hoverIntensity : config.strength
    const curveFunc = CURVE_FUNCTIONS[config.curve] || CURVE_FUNCTIONS.linear

    for (let i = 1; i <= config.divCount; i++) {
      let progress = i / config.divCount
      progress = curveFunc(progress)

      let blurValue
      if (config.exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * currentStrength
      } else {
        blurValue = 0.0625 * (progress * config.divCount + 1) * currentStrength
      }

      const p1 = Math.round((increment * i - increment) * 10) / 10
      const p2 = Math.round(increment * i * 10) / 10
      const p3 = Math.round((increment * i + increment) * 10) / 10
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10

      let gradient = `transparent ${p1}%, black ${p2}%`
      if (p3 <= 100) gradient += `, black ${p3}%`
      if (p4 <= 100) gradient += `, transparent ${p4}%`

      const direction = getGradientDirection(config.position)

      const divStyle = {
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: config.opacity,
        transition: config.animated && config.animated !== 'scroll' ? `backdrop-filter ${config.duration} ${config.easing}` : undefined
      }

      divs.push(<div key={i} className="absolute inset-0" style={divStyle} />)
    }

    return divs
  }, [config, isHovered])

  const containerStyle = useMemo(() => {
    const isVertical = ['top', 'bottom'].includes(config.position)
    const isHorizontal = ['left', 'right'].includes(config.position)
    const isPageTarget = config.target === 'page'

    const baseStyle = {
      position: isPageTarget ? 'fixed' : 'absolute',
      pointerEvents: config.hoverIntensity ? 'auto' : 'none',
      opacity: isVisible ? 1 : 0,
      transition: config.animated ? `opacity ${config.duration} ${config.easing}` : undefined,
      zIndex: isPageTarget ? config.zIndex + 100 : config.zIndex,
      ...config.style
    }

    if (isVertical) {
      baseStyle.height = config.height
      baseStyle.width = config.width || '100%'
      baseStyle[config.position] = 0
      baseStyle.left = 0
      baseStyle.right = 0
    } else if (isHorizontal) {
      baseStyle.width = config.width || config.height
      baseStyle.height = '100%'
      baseStyle[config.position] = 0
      baseStyle.top = 0
      baseStyle.bottom = 0
    }

    return baseStyle
  }, [config, isVisible])

  useEffect(() => {
    if (isVisible && config.animated === 'scroll' && config.onAnimationComplete) {
      const t = setTimeout(() => config.onAnimationComplete(), parseFloat(config.duration) * 1000)
      return () => clearTimeout(t)
    }
  }, [isVisible, config.animated, config.onAnimationComplete, config.duration])

  return (
    <div
      ref={containerRef}
      className={`gradual-blur relative isolate ${config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${config.className}`}
      style={containerStyle}
      onMouseEnter={config.hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={config.hoverIntensity ? () => setIsHovered(false) : undefined}
    >
      <div className="relative w-full h-full">{blurDivs}</div>
      {props.children && <div className="relative">{props.children}</div>}
    </div>
  )
}

export default GradualBlur
