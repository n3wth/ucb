import Link from "next/link"
import { Suspense } from "react"
import { UcbLogo } from "@/components/ucb-logo"
import { LoginForm } from "@/components/login-form"
import { APP_NAME } from "@/lib/config"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background bg-grain flex flex-col">
      {/* Top bar */}
      <div className="bg-sidebar border-b border-sidebar-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <UcbLogo size={32} showEyes={false} className="invert" />
            <span className="font-display text-base uppercase tracking-wide text-sidebar-foreground">
              {APP_NAME}
            </span>
          </Link>
        </div>
      </div>

      {/* Anchored login — not dead-center, offset toward top */}
      <div className="flex-1 flex items-start justify-center px-6 pt-20 sm:pt-28 pb-16">
        <div className="w-full max-w-sm space-y-6">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
          <p className="text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              ← Back to ucbbookings.com
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-5">
        <div className="container mx-auto px-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()} Upright Citizens Brigade
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            ucbbookings.com
          </p>
        </div>
      </footer>
    </main>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-pulse">
      <div className="h-4 w-20 bg-muted rounded" />
      <div className="h-11 bg-muted rounded" />
      <div className="h-11 bg-muted rounded" />
    </div>
  )
}
