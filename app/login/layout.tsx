import type { ReactNode } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader
        authSlot={
          <Link
            href="/"
            className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground/60 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            ← Back to home
          </Link>
        }
      />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
