import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { UcbLogo } from "@/components/ucb-logo"
import {
  ctaIconShiftClassName,
  headerSecondaryLinkClass,
  primaryCtaClassName,
} from "@/lib/site-chrome"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader
        authSlot={
          <Link
            href="/login"
            className={headerSecondaryLinkClass}
          >
            Sign in
          </Link>
        }
      />

      <section className="flex-1 flex items-center">
        <div className="mx-auto max-w-2xl w-full px-6 py-16 sm:py-24">
          <div className="flex items-center gap-4 mb-8 sm:mb-10">
            <UcbLogo size={40} showEyes={false} />
            <div className="h-6 w-px bg-border" aria-hidden="true" />
            <span className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground font-medium">
              Bookings
            </span>
          </div>

          <h1 className="font-display pl-4 sm:pl-5 -ml-px border-l-2 border-primary/35 text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight text-foreground">
            Internal booking tools for the UCB Artistic Team.
          </h1>

          <p className="mt-5 pl-4 sm:pl-5 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
            Confirm shows, send the ASSSSCAT cast booking email, and review the
            audit log. Sign in with your{" "}
            <span className="text-foreground">@ucbcomedy.com</span> account.
          </p>

          <div className="mt-10 pl-4 sm:pl-5">
            <Link
              href="/login"
              className={primaryCtaClassName}
            >
              <span>Sign in</span>
              <ArrowRight
                className={ctaIconShiftClassName}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
