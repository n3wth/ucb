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
            className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Home
          </Link>
        }
      />

      <section className="flex-1 flex items-center">
        <div className="mx-auto max-w-2xl w-full px-6 py-16 sm:py-24">
          <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/60 font-semibold">
            404
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight text-foreground">
            Page not found.
          </h1>
          <p className="mt-4 text-sm text-foreground/70 leading-relaxed max-w-md">
            The page you&apos;re looking for doesn&apos;t exist. Check the URL,
            or head back home.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 border-2 border-foreground bg-foreground px-5 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>Home</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/tools"
              className="group inline-flex items-center justify-center gap-2 border-2 border-foreground bg-background px-5 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-foreground hover:bg-foreground hover:text-background transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>Tools</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
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
