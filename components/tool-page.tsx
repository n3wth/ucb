import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ToolPageProps {
  title?: ReactNode
  description?: ReactNode
  /** Right-aligned actions (buttons, links) in the page header. */
  actions?: ReactNode
  /** Max width of the content column. Defaults to "md" (max-w-3xl). */
  size?: "sm" | "md" | "lg"
  className?: string
  children: ReactNode
}

const sizes = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
}

/**
 * Standard shell for any page under /tools.
 * Provides a consistent title/description block and content width.
 * Use this instead of re-creating the layout per tool.
 */
export function ToolPage({
  title,
  description,
  actions,
  size = "md",
  className,
  children,
}: ToolPageProps) {
  const hasHeader = title || description || actions

  return (
    <div className={cn("mx-auto w-full", sizes[size], className)}>
      {hasHeader && (
        <header className="mb-9 sm:mb-10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h1 className="font-display pl-4 sm:pl-5 -ml-px border-l-2 border-primary/35 text-2xl sm:text-3xl tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1.5 pl-4 sm:pl-5 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  )
}
