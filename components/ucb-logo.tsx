"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface UcbLogoProps {
  size?: number
  className?: string
  showEyes?: boolean
}

interface EyePosition {
  x: number
  y: number
}

function Eyeball({ 
  offsetX,
  offsetY,
  size,
  pupilOffset,
}: { 
  offsetX: number
  offsetY: number
  size: number
  pupilOffset: EyePosition
}) {
  const eyeRadius = size * 0.5
  const pupilRadius = size * 0.22
  const maxPupilOffset = eyeRadius - pupilRadius - 1
  
  const pupilX = pupilOffset.x * maxPupilOffset
  const pupilY = pupilOffset.y * maxPupilOffset

  return (
    <div 
      className="absolute rounded-full bg-white border border-foreground/20 flex items-center justify-center overflow-hidden"
      style={{
        left: `${offsetX}%`,
        top: `${offsetY}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div 
        className="absolute rounded-full bg-foreground transition-transform duration-100 ease-out"
        style={{
          width: pupilRadius * 2,
          height: pupilRadius * 2,
          transform: `translate(${pupilX}px, ${pupilY}px)`,
        }}
      >
        <div 
          className="absolute rounded-full bg-white"
          style={{
            width: pupilRadius * 0.5,
            height: pupilRadius * 0.5,
            top: "15%",
            right: "15%",
          }}
        />
      </div>
    </div>
  )
}

export function UcbLogo({
  size = 36,
  className = "",
  showEyes = true,
}: UcbLogoProps) {
  const [pupilOffset, setPupilOffset] = useState<EyePosition>({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const eyeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const lookRandomDirection = useCallback(() => {
    if (prefersReducedMotion || isHovering) return
    
    const patterns = [
      { x: 0, y: 0 },
      { x: 0.8, y: 0 },
      { x: -0.8, y: 0 },
      { x: 0, y: -0.6 },
      { x: 0, y: 0.6 },
      { x: 0.5, y: -0.5 },
      { x: -0.5, y: -0.5 },
      { x: 0.5, y: 0.5 },
      { x: -0.5, y: 0.5 },
    ]
    
    const target = patterns[Math.floor(Math.random() * patterns.length)]
    setPupilOffset(target)
  }, [prefersReducedMotion, isHovering])

  useEffect(() => {
    if (!showEyes || prefersReducedMotion) return

    const scheduleNext = () => {
      const delay = 800 + Math.random() * 2000
      eyeTimeoutRef.current = setTimeout(() => {
        lookRandomDirection()
        scheduleNext()
      }, delay)
    }

    scheduleNext()

    return () => {
      if (eyeTimeoutRef.current) clearTimeout(eyeTimeoutRef.current)
    }
  }, [showEyes, prefersReducedMotion, lookRandomDirection])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReducedMotion || !showEyes || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = Math.max(rect.width, rect.height) * 1.5
    const normalizedDistance = Math.min(1, distance / maxDistance)
    
    const angle = Math.atan2(deltaY, deltaX)
    const x = Math.cos(angle) * normalizedDistance
    const y = Math.sin(angle) * normalizedDistance
    
    setPupilOffset({ x, y })
  }, [prefersReducedMotion, showEyes])

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setPupilOffset({ x: 0, y: 0 })
  }

  const eyeSize = size * 0.22

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src="/ucb.svg"
        alt="UCB"
        width={size}
        height={size}
        className="invert object-contain"
        style={{ width: size, height: size }}
        priority
      />
      
      {showEyes && (
        <>
          <Eyeball 
            offsetX={36} 
            offsetY={38} 
            size={eyeSize} 
            pupilOffset={pupilOffset} 
          />
          <Eyeball 
            offsetX={64} 
            offsetY={38} 
            size={eyeSize} 
            pupilOffset={pupilOffset} 
          />
        </>
      )}
    </div>
  )
}
