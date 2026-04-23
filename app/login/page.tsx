import { Suspense } from "react"
import Image from "next/image"
import { LoginForm } from "@/components/login-form"
import { APP_NAME, APP_TAGLINE } from "@/lib/config"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="h-1 w-full bg-primary" aria-hidden="true" />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" aria-hidden="true" />
              <Image
                src="/ucb.svg"
                alt="UCB"
                width={72}
                height={72}
                className="relative h-18 w-18 invert"
                priority
              />
            </div>
            <div className="text-center space-y-2">
              <h1 className="font-display text-2xl uppercase tracking-wider text-balance">
                {APP_NAME.replace("UCB ", "")}
              </h1>
              <p className="text-xs uppercase tracking-widest text-muted-foreground text-pretty">
                {APP_TAGLINE}
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
