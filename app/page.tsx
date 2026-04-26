import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LiveTimestamp } from "@/components/live-timestamp"

export const dynamic = "force-dynamic"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top hairline strip */}
      <div className="border-b border-border">
        <div className="flex items-center justify-between px-5 sm:px-8 h-9 text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-medium">
          <span className="tabular-nums">UCB · Internal</span>
          <LiveTimestamp className="font-mono tracking-[0.05em] normal-case text-foreground/80" />
        </div>
      </div>

      {/* Horizontal split */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] page-fade-in">
        {/* LEFT: identity */}
        <div className="relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border px-6 sm:px-10 lg:px-14 py-14 sm:py-20">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground font-medium">
              Bookings · v1
            </p>

            <h1
              className="mt-10 sm:mt-14 font-display text-foreground leading-[0.88] tracking-[-0.04em] text-[clamp(5rem,16vw,12rem)]"
              style={{ fontWeight: 800 }}
            >
              UCB
            </h1>

            <p className="mt-8 sm:mt-10 max-w-md text-sm sm:text-base text-foreground/85 leading-relaxed">
              Internal bookings <span className="text-muted-foreground">·</span>{" "}
              for the artistic team.
            </p>

            <p className="mt-6 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
              @ucbcomedy.com only
            </p>
          </div>
        </div>

        {/* RIGHT: sign-in panel */}
        <div className="flex items-center justify-center px-6 sm:px-10 lg:px-14 py-14 sm:py-20">
          <div className="w-full max-w-sm border border-border bg-card">
            <div className="px-6 sm:px-7 pt-6 pb-5 border-b border-border">
              <p className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground font-medium">
                Authentication
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-[1.6rem] tracking-tight text-foreground" style={{ fontWeight: 600 }}>
                Sign in
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Use your <span className="text-foreground">@ucbcomedy.com</span> Google account to continue.
              </p>
            </div>

            <div className="px-6 sm:px-7 py-6">
              <Link
                href="/login"
                className="group inline-flex w-full items-center justify-center gap-2 border border-foreground bg-foreground px-4 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-background hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span>Continue to sign in</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  aria-hidden="true"
                />
              </Link>

              <p className="mt-5 pt-5 border-t border-border text-[11px] leading-relaxed text-muted-foreground">
                All sign-ins and booking actions are written to the audit log with your name, account, and timestamp.
              </p>
            </div>
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
