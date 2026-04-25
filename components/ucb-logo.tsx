import Image from "next/image"
import { cn } from "@/lib/utils"

interface UcbLogoProps {
  size?: number
  className?: string
}

export function UcbLogo({ size = 36, className = "" }: UcbLogoProps) {
  return (
    <div
      className={cn("relative select-none", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/ucb.svg"
        alt="UCB"
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size }}
        priority
      />
    </div>
  )
}
