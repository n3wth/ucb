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

export function UcbLogo({ size = 36, className = "", showEyes = false }: UcbLogoProps) {
  const [pupilOffset, setPupilOffset] = useState<EyePosition>({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Random look-around behavior
  const lookRandomDirection = useCallback(() => {
    if (isHovering) return
    const directions = [
      { x: 0, y: 0 },
      { x: 0.7, y: 0 },
      { x: -0.7, y: 0 },
      { x: 0, y: -0.5 },
      { x: 0, y: 0.5 },
      { x: 0.5, y: -0.4 },
      { x: -0.5, y: -0.4 },
    ]
    setPupilOffset(directions[Math.floor(Math.random() * directions.length)])
  }, [isHovering])

  useEffect(() => {
    if (!showEyes) return

    const scheduleNext = () => {
      const delay = 1200 + Math.random() * 2500
      timeoutRef.current = setTimeout(() => {
        lookRandomDirection()
        scheduleNext()
      }, delay)
    }

    scheduleNext()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [showEyes, lookRandomDirection])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!showEyes || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = Math.max(rect.width, rect.height) * 2
    const norm = Math.min(1, dist / maxDist)

    const angle = Math.atan2(dy, dx)
    setPupilOffset({ x: Math.cos(angle) * norm, y: Math.sin(angle) * norm })
  }, [showEyes])

  const eyeSize = Math.max(6, size * 0.18)
  const pupilSize = eyeSize * 0.45

  return (
    <div
      ref={containerRef}
      className={cn("relative select-none", className)}
      style={{ width: size, height: size }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false)
        setPupilOffset({ x: 0, y: 0 })
      }}
    >
      <Image
        src="/ucb.svg"
        alt="UCB"
        width={size}
        height={size}
        className={cn("object-contain ucb-mark-adaptive")}
        style={{ width: size, height: size }}
        priority
      />

      {showEyes && (
        <>
          <Eye
            x={36}
            y={42}
            eyeSize={eyeSize}
            pupilSize={pupilSize}
            offset={pupilOffset}
          />
          <Eye
            x={64}
            y={42}
            eyeSize={eyeSize}
            pupilSize={pupilSize}
            offset={pupilOffset}
          />
        </>
      )}
    </div>
  )
}

function Eye({
  x,
  y,
  eyeSize,
  pupilSize,
  offset,
}: {
  x: number
  y: number
  eyeSize: number
  pupilSize: number
  offset: EyePosition
}) {
  const maxOffset = (eyeSize - pupilSize) / 2 - 1
  const px = offset.x * maxOffset
  const py = offset.y * maxOffset

  return (
    <div
      className="absolute rounded-full bg-white flex items-center justify-center"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: eyeSize,
        height: eyeSize,
        transform: "translate(-50%, -50%)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
      }}
    >
      <div
        className="rounded-full bg-foreground transition-transform duration-75 ease-out"
        style={{
          width: pupilSize,
          height: pupilSize,
          transform: `translate(${px}px, ${py}px)`,
        }}
      >
        <div
          className="absolute rounded-full bg-white/90"
          style={{
            width: pupilSize * 0.35,
            height: pupilSize * 0.35,
            top: "12%",
            right: "12%",
          }}
        />
      </div>
    </div>
  )
}
