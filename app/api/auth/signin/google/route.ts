import { NextRequest, NextResponse } from "next/server"
import { getSignInAuthUrl, hasGoogleSignInConfig } from "@/lib/google-signin"

export const SIGNIN_STATE_COOKIE = "ucb_signin_state"
export const SIGNIN_NEXT_COOKIE = "ucb_signin_next"
const STATE_MAX_AGE_SECONDS = 60 * 10 // 10 minutes

function randomState(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  let s = ""
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i].toString(16).padStart(2, "0")
  }
  return s
}

function sanitizeNextPath(next: string | null): string {
  if (!next) return "/tools"
  // Only allow same-origin absolute paths.
  if (!next.startsWith("/") || next.startsWith("//")) return "/tools"
  return next
}

// GET /api/auth/signin/google - Begin Google sign-in for users.
// Redirects the user to Google's consent screen. The callback at
// /api/auth/callback/signin verifies the email domain and sets a session.
export async function GET(request: NextRequest) {
  if (!hasGoogleSignInConfig()) {
    return NextResponse.redirect(new URL("/login?error=google_signin_unconfigured", request.url))
  }

  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"))
  const state = randomState()
  const url = getSignInAuthUrl(state)

  const res = NextResponse.redirect(url)
  res.cookies.set(SIGNIN_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STATE_MAX_AGE_SECONDS,
  })
  res.cookies.set(SIGNIN_NEXT_COOKIE, next, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STATE_MAX_AGE_SECONDS,
  })
  return res
}
