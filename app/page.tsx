import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

function formatToday(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(date)
}

export default function LandingPage() {
  const now = new Date()
  const todayLong = formatToday(now).toUpperCase()

  return (
    <main className="relative min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Lurking UCB logo — sits behind everything at very low opacity. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <Image
          src="/ucb.svg"
          alt=""
          width={1588}
          height={954}
          priority
          className="w-[140%] max-w-none opacity-[0.035] dark:opacity-[0.05] translate-y-[6%]"
        />
      </div>

      {/* Soft yellow wash — adds warmth without a hard glow. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/4 h-[24rem] w-[24rem] rounded-full bg-primary/[0.06] blur-3xl"
      />

      <div className="relative flex flex-col flex-1">
        <SiteHeader
          subStrip
          authSlot={
            <Link
              href="/login"
              className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground underline underline-offset-[6px] decoration-1 hover:text-primary hover:decoration-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Stage Door
            </Link>
          }
        />

        <section className="flex-1">
          <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              <div className="lg:col-span-8">
                <p className="mb-6 inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-primary font-semibold">
                  <span className="inline-block h-px w-8 bg-primary" />
                  In House
                </p>
                <h1 className="font-serif text-5xl sm:text-7xl lg:text-[5.75rem] leading-[0.95] tracking-tight text-balance">
                  Internal tools for the{" "}
                  <em className="not-italic text-primary font-black relative">
                    UCB
                    <span
                      aria-hidden
                      className="absolute inset-x-0 -bottom-1 h-[0.35em] bg-primary/25 -z-10"
                    />
                  </em>
                  <span className="italic font-normal"> artistic team.</span>
                </h1>
              </div>

              <aside className="lg:col-span-4 lg:pt-2">
                <div className="border-t-2 border-primary pt-4">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-semibold">
                    Today
                  </p>
                  <p className="mt-3 font-display text-xl sm:text-2xl tracking-[0.04em] uppercase leading-tight">
                    {todayLong}
                  </p>
                  <div aria-hidden className="mt-6 h-px w-full bg-foreground/20" />
                  <p className="mt-6 text-sm leading-relaxed text-foreground/70">
                    Don&apos;t think. Book.
                  </p>
                  <Link
                    href="/login"
                    className="group mt-8 inline-flex w-full items-center justify-between gap-3 border-2 border-primary bg-primary px-5 py-4 text-sm font-semibold tracking-[0.2em] uppercase text-primary-foreground hover:bg-foreground hover:text-background hover:border-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cta-shimmer"
                  >
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  )
}
