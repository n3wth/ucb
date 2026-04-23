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
  effectInterval?: [number, number] // [min, max] seconds between effects
  effectDuration?: [number, number] // [min, max] seconds per effect
}

export function LogoFx({
  src,
  alt,
  width,
  height,
  className = "",
  effectInterval = [12, 30],
  effectDuration = [1.5, 2.5],
}: LogoFxProps) {
  const [activeEffect, setActiveEffect] = useState<Effect | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const effectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check for reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

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

  return (
    <>
      {/* SVG Filters for effects */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          {/* Color channel filters for glitch */}
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
          
          {/* Ripple displacement filters at different stages */}
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
        className={`logo-fx-wrapper ${effectClass}`}
        onMouseEnter={handleMouseEnter}
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
      </div>
    </>
  )
}
