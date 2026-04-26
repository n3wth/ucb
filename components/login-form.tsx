"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Lock, AlertCircle, ArrowRight } from "lucide-react"

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_signin_unconfigured: "Google sign-in is not yet configured for this site.",
  email_not_allowed: "That Google account is not allowed. Use your @ucbcomedy.com address.",
  email_unverified: "Your Google email is not verified.",
  bad_state: "Sign-in session expired. Please try again.",
  missing_code: "Sign-in was cancelled or incomplete.",
  token_exchange_failed: "Could not complete sign-in with Google.",
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") || "/tools"
  const oauthError = searchParams.get("error")
  const initialError = oauthError ? (OAUTH_ERROR_MESSAGES[oauthError] || "Sign-in failed.") : null

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  const onGoogleSignIn = () => {
    setGoogleLoading(true)
    const url = `/api/auth/signin/google?next=${encodeURIComponent(nextPath)}`
    window.location.assign(url)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Login failed")
        setLoading(false)
        return
      }
      router.push(nextPath)
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-foreground">Sign in</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">Enter the shared team password to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10"
            onClick={onGoogleSignIn}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Redirecting to Google...
              </>
            ) : (
              <>
                <GoogleIcon className="h-4 w-4 mr-2" />
                Sign in with Google
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            Use your @ucbcomedy.com Google account.
          </p>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">
                <Lock className="inline-block h-3.5 w-3.5 mr-1.5 -mt-0.5 text-muted-foreground" />
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-11 placeholder:text-muted-foreground"
                placeholder="Enter password"
                required
                autoFocus
              />
            </Field>
          </FieldGroup>
          <Button
            type="submit"
            className="w-full h-10 group"
            disabled={loading || !password}
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Signing in...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.32z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}
