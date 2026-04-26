import { cn } from "@/lib/utils"

/** Uppercase header actions: Sign in, Home, Back (pairs with `SiteHeader`). */
export const headerSecondaryLinkClass =
  "text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export const headerIconLinkClass = cn(
  "inline-flex items-center gap-1.5",
  headerSecondaryLinkClass,
)

/**
 * Shared icon-button shell used in the header right cluster (theme toggle,
 * settings, sign out). Keeping all three on the same shape, rounding, color,
 * and stroke weight makes the row feel optically aligned even though the
 * lucide glyphs each have slightly different visual centers.
 */
export const headerIconButtonClass =
  "inline-flex items-center justify-center h-8 w-9 rounded-sm text-foreground/60 hover:text-foreground hover:bg-foreground/[0.05] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:shrink-0"

/**
 * Form input shell used by every text/select/textarea in the tools — solid
 * `bg-input` instead of shadcn's transparent default, with the focus ring
 * pinned to the primary color so it lights up consistently across themes.
 *
 * Heights:
 *   - "compact" (h-9, smaller text) — table rows and list editors
 *   - "default" (h-10) — most forms
 *   - "tall" (h-11) — single-input gates like /login
 */
const FORM_INPUT_BASE =
  "bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"

const FORM_INPUT_HEIGHTS = {
  compact: "h-9 text-sm",
  default: "h-10",
  tall: "h-11",
} as const

export type FormInputHeight = keyof typeof FORM_INPUT_HEIGHTS

export function formInputClassName(height: FormInputHeight = "default"): string {
  return `${FORM_INPUT_BASE} ${FORM_INPUT_HEIGHTS[height]}`
}

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
