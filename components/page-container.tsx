import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizes = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-4xl",
}

export function PageContainer({ children, className, size = "md" }: PageContainerProps) {
  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      <div className={cn("mx-auto", sizes[size])}>{children}</div>
    </div>
  )
}
