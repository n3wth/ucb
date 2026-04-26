import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  ctaIconShiftClassName,
  headerSecondaryLinkClass,
  primaryCtaClassName,
  secondaryOutlineCtaClassName,
} from "@/lib/site-chrome"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader
        authSlot={
          <Link
            href="/"
            className={headerSecondaryLinkClass}
          >
            Home
          </Link>
        }
      />

      <section className="flex-1 flex items-center">
        <div className="mx-auto max-w-2xl w-full px-6 py-16 sm:py-24">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-semibold">
            404
          </p>
          <h1 className="mt-3 pl-4 sm:pl-5 -ml-px font-display text-3xl sm:text-4xl tracking-tight text-foreground border-l-2 border-primary/35">
            Page not found.
          </h1>
          <p className="mt-4 pl-4 sm:pl-5 text-sm text-muted-foreground leading-relaxed max-w-md">
            The page you&apos;re looking for doesn&apos;t exist. Check the URL,
            or head back home.
          </p>

          <div className="mt-10 pl-4 sm:pl-5 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className={primaryCtaClassName}
            >
              <span>Home</span>
              <ArrowRight
                className={ctaIconShiftClassName}
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/tools"
              className={secondaryOutlineCtaClassName}
            >
              <span>Tools</span>
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
