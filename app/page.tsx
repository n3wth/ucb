import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LiveTimestamp } from "@/components/live-timestamp"

export const dynamic = "force-dynamic"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top hairline strip */}
      <div className="border-b border-border">
        <div className="flex items-center justify-between px-5 sm:px-8 h-9 text-[11px] text-muted-foreground">
          <span>UCB · Internal</span>
          <LiveTimestamp />
        </div>
      </div>

      {/* Split */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] page-fade-in">
        {/* LEFT: identity, top-aligned */}
        <div className="border-b lg:border-b-0 lg:border-r border-border px-6 sm:px-10 lg:px-14 pt-14 sm:pt-20 pb-14">
          <Image
            src="/ucb-wordmark.svg"
            alt="UCB Comedy"
            width={2006}
            height={313}
            className="w-[clamp(180px,28vw,320px)] h-auto dark:invert gay:invert"
            priority
          />

          <h1
            className="mt-6 sm:mt-8 font-display text-foreground leading-[0.92] tracking-[-0.035em] text-[clamp(3rem,8vw,7rem)]"
            style={{ fontWeight: 700 }}
          >
            Bookings
          </h1>

          <p className="mt-8 sm:mt-10 max-w-md text-base sm:text-lg text-foreground/80 leading-snug">
            Internal bookings for the artistic team.
          </p>
        </div>

        {/* RIGHT: sign-in, anchored to bottom */}
        <div className="flex flex-col justify-end px-6 sm:px-10 lg:px-14 pt-14 pb-14 sm:pb-20">
          <div className="max-w-md">
            <h2
              className="font-display text-foreground tracking-[-0.02em] text-3xl sm:text-4xl"
              style={{ fontWeight: 700 }}
            >
              Sign in
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Use your <span className="text-foreground">@ucbcomedy.com</span>{" "}
              Google account to continue.
            </p>

            <Link
              href="/login"
              className="group mt-6 inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-background hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>Continue</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                aria-hidden="true"
              />
            </Link>

            <p className="mt-8 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
              All sign-ins and booking actions are written to the audit log with your name, account, and timestamp.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom hairline */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between px-5 sm:px-8 h-9 text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-medium tabular-nums">
          <span>© {new Date().getFullYear()} Upright Citizens Brigade</span>
          <a
            href="https://ucbcomedy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            ucbcomedy.com <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </main>
  )
}
