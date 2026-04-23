import { Suspense } from "react"
import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="h-1 w-full bg-primary" aria-hidden="true" />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-5 mb-8">
            <Image src="/ucb.svg" alt="UCB" width={64} height={64} className="h-16 w-16 invert" priority />
            <div className="text-center space-y-2">
              <h1 className="font-display text-3xl uppercase tracking-wider text-balance">
                Show Confirmation
              </h1>
              <p className="text-xs uppercase tracking-widest text-muted-foreground text-pretty">
                Every show, confirmed in 300 clicks.
              </p>
            </div>
          </div>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
