import { NextRequest, NextResponse } from "next/server"
import {
  GoogleSignInError,
  getAllowedDomain,
  isAllowedEmail,
  verifySignInCode,
} from "@/lib/google-signin"
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session"
import { SIGNIN_NEXT_COOKIE, SIGNIN_STATE_COOKIE } from "../../signin/google/route"

function sanitizeNextPath(next: string | undefined): string {
  if (!next) return "/tools"
  if (!next.startsWith("/") || next.startsWith("//")) return "/tools"
  return next
}

function loginRedirect(request: NextRequest, error: string): NextResponse {
  const res = NextResponse.redirect(new URL(`/login?error=${error}`, request.url))
  // Always clear sign-in cookies on terminal outcomes.
  res.cookies.set(SIGNIN_STATE_COOKIE, "", { path: "/", maxAge: 0 })
  res.cookies.set(SIGNIN_NEXT_COOKIE, "", { path: "/", maxAge: 0 })
  return res
}

// GET /api/auth/callback/signin - Google OAuth callback for user sign-in.
// Validates state, exchanges code, verifies the email belongs to the allowed
// domain, then sets the standard session cookie.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const code = params.get("code")
  const state = params.get("state")
  const oauthError = params.get("error")

  if (oauthError) {
    return loginRedirect(request, encodeURIComponent(oauthError))
  }
  if (!code || !state) {
    return loginRedirect(request, "missing_code")
  }

  const expectedState = request.cookies.get(SIGNIN_STATE_COOKIE)?.value
  if (!expectedState || expectedState !== state) {
    return loginRedirect(request, "bad_state")
  }

  let user
  try {
    user = await verifySignInCode(code)
  } catch (err) {
    const detail = err instanceof GoogleSignInError ? err.message : String(err)
    console.log("[v0] signin callback: verify failed", detail)
    return loginRedirect(request, "token_exchange_failed")
  }

  if (!user.emailVerified) {
    return loginRedirect(request, "email_unverified")
  }

  const allowedDomain = getAllowedDomain()
  if (!isAllowedEmail(user.email, allowedDomain)) {
    console.log("[v0] signin callback: email not allowed", { email: user.email, allowedDomain })
    return loginRedirect(request, "email_not_allowed")
  }

  const next = sanitizeNextPath(request.cookies.get(SIGNIN_NEXT_COOKIE)?.value)
  const token = await signSession(SESSION_MAX_AGE, { email: user.email })
  const res = NextResponse.redirect(new URL(next, request.url))
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  res.cookies.set(SIGNIN_STATE_COOKIE, "", { path: "/", maxAge: 0 })
  res.cookies.set(SIGNIN_NEXT_COOKIE, "", { path: "/", maxAge: 0 })
  return res
}
