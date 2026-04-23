"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import "@/styles/logo-fx.css"

const EFFECTS = ["glitch", "neon", "hue", "rainbow"] as const
type Effect = (typeof EFFECTS)[number]

interface LogoFxProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  effectInterval?: [number, number]
  effectDuration?: [number, number]
  showEyes?: boolean
}

interface EyePosition {
  x: number
  y: number
}

function Eyeball({ 
  cx, 
  cy, 
  size, 
  pupilOffset 
}: { 
  cx: number
  cy: number
  size: number
  pupilOffset: EyePosition
}) {
  const pupilSize = size * 0.4
  const maxOffset = size * 0.25
  
  const clampedX = Math.max(-maxOffset, Math.min(maxOffset, pupilOffset.x * maxOffset))
  const clampedY = Math.max(-maxOffset, Math.min(maxOffset, pupilOffset.y * maxOffset))

  return (
    <g>
      {/* Eye white */}
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill="white"
        stroke="currentColor"
        strokeWidth={size * 0.1}
      />
      {/* Pupil */}
      <circle
        cx={cx + clampedX}
        cy={cy + clampedY}
        r={pupilSize}
        fill="currentColor"
        style={{ transition: "cx 0.15s ease-out, cy 0.15s ease-out" }}
      />
      {/* Highlight */}
      <circle
        cx={cx + clampedX + pupilSize * 0.3}
        cy={cy + clampedY - pupilSize * 0.3}
        r={pupilSize * 0.25}
        fill="white"
        style={{ transition: "cx 0.15s ease-out, cy 0.15s ease-out" }}
      />
    </g>
  )
}

export function LogoFx({
  src,
  alt,
  width,
  height,
  className = "",
  effectInterval = [12, 30],
  effectDuration = [1.5, 2.5],
  showEyes = true,
}: LogoFxProps) {
  const [activeEffect, setActiveEffect] = useState<Effect | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [pupilOffset, setPupilOffset] = useState<EyePosition>({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const effectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eyeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check for reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Random eye movement
  const lookRandomDirection = useCallback(() => {
    if (prefersReducedMotion) return
    
    // Sometimes look at specific directions, sometimes random
    const patterns = [
      { x: 0, y: 0 },      // center
      { x: 1, y: 0 },      // right
      { x: -1, y: 0 },     // left
      { x: 0, y: -1 },     // up
      { x: 0, y: 1 },      // down
      { x: 0.7, y: -0.7 }, // up-right
      { x: -0.7, y: -0.7 },// up-left
      { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }, // random
    ]
    
    const target = patterns[Math.floor(Math.random() * patterns.length)]
    setPupilOffset(target)
  }, [prefersReducedMotion])

  const scheduleEyeMovement = useCallback(() => {
    if (prefersReducedMotion || !showEyes) return
    
    const delay = 0.5 + Math.random() * 2.5 // Look around every 0.5-3 seconds
    
    eyeTimeoutRef.current = setTimeout(() => {
      lookRandomDirection()
      scheduleEyeMovement()
    }, delay * 1000)
  }, [prefersReducedMotion, showEyes, lookRandomDirection])

  useEffect(() => {
    if (showEyes) {
      scheduleEyeMovement()
    }
    return () => {
      if (eyeTimeoutRef.current) clearTimeout(eyeTimeoutRef.current)
    }
  }, [showEyes, scheduleEyeMovement])

  // Follow mouse when hovering
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReducedMotion || !showEyes || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY
    
    // Normalize to -1 to 1 range
    const maxDistance = Math.max(rect.width, rect.height) * 2
    const x = Math.max(-1, Math.min(1, deltaX / maxDistance * 2))
    const y = Math.max(-1, Math.min(1, deltaY / maxDistance * 2))
    
    setPupilOffset({ x, y })
  }, [prefersReducedMotion, showEyes])

  const handleMouseLeave = useCallback(() => {
    // Return to random looking behavior
    lookRandomDirection()
  }, [lookRandomDirection])

  const triggerEffect = useCallback(() => {
    if (prefersReducedMotion) return
    
    const effect = EFFECTS[Math.floor(Math.random() * EFFECTS.length)]
    const duration = effectDuration[0] + Math.random() * (effectDuration[1] - effectDuration[0])
    
    setActiveEffect(effect)
    
    effectTimeoutRef.current = setTimeout(() => {
      setActiveEffect(null)
    }, duration * 1000)
  }, [prefersReducedMotion, effectDuration])

  const scheduleNextEffect = useCallback(() => {
    if (prefersReducedMotion) return
    
    const delay = effectInterval[0] + Math.random() * (effectInterval[1] - effectInterval[0])
    
    timeoutRef.current = setTimeout(() => {
      triggerEffect()
      scheduleNextEffect()
    }, delay * 1000)
  }, [prefersReducedMotion, effectInterval, triggerEffect])

  useEffect(() => {
    scheduleNextEffect()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (effectTimeoutRef.current) clearTimeout(effectTimeoutRef.current)
    }
  }, [scheduleNextEffect])

  const handleMouseEnter = () => {
    if (prefersReducedMotion || activeEffect) return
    triggerEffect()
  }

  const effectClass = activeEffect ? `logo-fx-${activeEffect}` : ""

  // Eye positioning relative to logo size
  const eyeSize = width * 0.08
  const leftEyeX = width * 0.35
  const rightEyeX = width * 0.65
  const eyeY = height * 0.35

  return (
    <>
      {/* SVG Filters for effects */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id="logo-fx-red">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="logo-fx-blue">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="logo-fx-ripple-0">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" />
          </filter>
          <filter id="logo-fx-ripple-25">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
          </filter>
          <filter id="logo-fx-ripple-50">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" />
          </filter>
          <filter id="logo-fx-ripple-75">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
          </filter>
          <filter id="logo-fx-ripple-100">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" />
          </filter>
        </defs>
      </svg>

      <div
        ref={containerRef}
        className={`logo-fx-wrapper ${effectClass} relative`}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority
          style={{ background: "transparent" }}
        />
        
        {/* Eyeballs overlay */}
        {showEyes && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            aria-hidden="true"
          >
            <Eyeball cx={leftEyeX} cy={eyeY} size={eyeSize} pupilOffset={pupilOffset} />
            <Eyeball cx={rightEyeX} cy={eyeY} size={eyeSize} pupilOffset={pupilOffset} />
          </svg>
        )}
      </div>
    </>
  )
}
