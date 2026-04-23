import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 animate-pulse">
      <div className="h-4 w-20 bg-muted rounded" />
      <div className="h-11 bg-muted rounded" />
      <div className="h-11 bg-muted rounded" />
    </div>
  )
}
