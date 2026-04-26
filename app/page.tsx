import Image from "next/image"
import Link from "next/link"
import { cookies } from "next/headers"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SiteStatusStrip } from "@/components/site-status-strip"
import { HeaderAuth } from "@/components/header-auth"
import { readSession, SESSION_COOKIE } from "@/lib/session"
import {
  ctaIconShiftClassName,
  primaryCtaClassName,
} from "@/lib/site-chrome"

export const dynamic = "force-dynamic"

export default async function LandingPage() {
  const cookieStore = await cookies()
  const session = await readSession(cookieStore.get(SESSION_COOKIE)?.value)
  const isAuthed = session !== null

  const ctaHref = isAuthed ? "/tools" : "/login"
  const ctaLabel = isAuthed ? "Open tools" : "Continue"

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader authSlot={<HeaderAuth />} />
      <SiteStatusStrip />

      {/*
        Split layout. Single .app-shell column wrapper so the left edge of
        the body content lines up with the wordmark, status strip, and
        footer. Inside, lg+ becomes a 2-column grid with the right column
        getting a left border that runs the full height of the section.
      */}
      <section className="flex-1 page-fade-in">
        <div className="app-shell h-full grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          {/* LEFT */}
          <div className="pt-10 sm:pt-16 lg:pt-20 pb-8 lg:pb-14 lg:pr-10 xl:pr-14">
            <Image
              src="/ucb-wordmark.svg"
              alt="UCB Comedy"
              width={1983}
              height={313}
              className="block w-[clamp(220px,38vw,460px)] h-auto dark:invert gay:invert"
              priority
            />

            <h1
              className="mt-3 sm:mt-4 font-display text-foreground/90 leading-[0.92] tracking-[-0.035em] text-[clamp(2.25rem,6vw,4.5rem)]"
              style={{ fontWeight: 600 }}
            >
              Bookings
            </h1>

            <p className="mt-6 sm:mt-8 max-w-md text-base sm:text-lg text-foreground/80 leading-snug">
              Internal bookings for the artistic team.
            </p>
          </div>

          {/* RIGHT */}
          <div className="pt-10 sm:pt-16 lg:pt-20 pb-10 sm:pb-14 lg:pb-20 lg:pl-10 xl:pl-14 lg:border-l border-border">
            <div className="max-w-md">
              <h2
                className="font-display text-foreground tracking-[-0.02em] text-2xl sm:text-3xl lg:text-4xl"
                style={{ fontWeight: 700 }}
              >
                {isAuthed ? "Welcome back" : "Sign in"}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {isAuthed ? (
                  <>
                    {session?.email ? (
                      <>
                        Signed in as{" "}
                        <span className="text-foreground">{session.email}</span>.
                      </>
                    ) : (
                      <>You are signed in.</>
                    )}{" "}
                    Continue to the tools hub.
                  </>
                ) : (
                  <>
                    Use your <span className="text-foreground">@ucbcomedy.com</span>{" "}
                    Google account to continue.
                  </>
                )}
              </p>

              <Link href={ctaHref} className={`${primaryCtaClassName} mt-6`}>
                <span>{ctaLabel}</span>
                <ArrowRight className={ctaIconShiftClassName} aria-hidden="true" />
              </Link>

              <p className="mt-8 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
                All sign-ins and booking actions are written to the audit log with your name, account, and timestamp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
