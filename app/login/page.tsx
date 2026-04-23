import { Suspense } from "react"
import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Image src="/ucb.svg" alt="UCB" width={56} height={56} className="h-14 w-14" priority />
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">UCB Show Confirmation</h1>
            <p className="text-sm text-muted-foreground text-pretty">Every show, confirmed in 300 clicks.</p>
          </div>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
