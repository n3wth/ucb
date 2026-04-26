import { cn } from "@/lib/utils"

/** Uppercase header actions: Sign in, Home, Back (pairs with `SiteHeader`). */
export const headerSecondaryLinkClass =
  "text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export const headerIconLinkClass = cn(
  "inline-flex items-center gap-1.5",
  headerSecondaryLinkClass,
)

/** Primary solid CTA (landing, 404, etc.). */
export const primaryCtaClassName = cn(
  "group inline-flex items-center justify-center gap-2 border-2 border-foreground/90 bg-foreground px-5 py-3.5 sm:py-3 text-xs font-semibold tracking-[0.2em] uppercase text-background",
  "shadow-[0_1px_2px_rgba(0,0,0,0.12)]",
  "hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-sm",
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "active:translate-y-px",
)

export const secondaryOutlineCtaClassName = cn(
  "group inline-flex items-center justify-center gap-2 border-2 border-foreground bg-background px-5 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-foreground",
  "hover:bg-foreground hover:text-background",
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "active:translate-y-px",
)

/** Nudge on hover for CTA / link trailing icons. Respects reduced motion. */
export const ctaIconShiftClassName =
  "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
