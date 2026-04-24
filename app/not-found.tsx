import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader
        authSlot={
          <Link
            href="/"
            className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground underline underline-offset-[6px] decoration-1 hover:text-primary hover:decoration-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Back
          </Link>
        }
      />

      <section className="flex-1">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-8">
              <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/60 font-semibold">
                Error 404
              </p>
              <h1 className="mt-4 font-serif text-5xl sm:text-7xl lg:text-[5.75rem] leading-[0.95] tracking-tight text-balance">
                That scene{" "}
                <em className="not-italic text-primary font-black">isn&apos;t</em>
                <span className="italic font-normal"> in the show.</span>
              </h1>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-foreground/70">
                The page you&apos;re looking for has wrapped for the night. Maybe
                it got cut in tech, or maybe you mistyped the URL. Either way —
                nothing to see here but the ghost light.
              </p>
            </div>

            <aside className="lg:col-span-4 lg:pt-2">
              <div className="border-t-2 border-foreground pt-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/60 font-semibold">
                  Exits
                </p>
                <div
                  aria-hidden
                  className="mt-6 text-6xl leading-none select-none"
                  title="Blink"
                >
                  <span className="inline-block hover-wiggle">👁️</span>
                </div>
                <div aria-hidden className="mt-6 h-px w-full bg-foreground/20" />
                <Link
                  href="/"
                  className="group mt-8 inline-flex w-full items-center justify-between gap-3 border-2 border-foreground bg-foreground px-5 py-4 text-sm font-semibold tracking-[0.2em] uppercase text-background hover:bg-primary hover:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cta-shimmer"
                >
                  <span>Back to lobby</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/tools"
                  className="group mt-3 inline-flex w-full items-center justify-between gap-3 border-2 border-foreground bg-background px-5 py-4 text-sm font-semibold tracking-[0.2em] uppercase text-foreground hover:bg-foreground hover:text-background transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span>Stage door</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
