import { google } from "googleapis"
import { env } from "./env"

export const DEFAULT_ALLOWED_DOMAIN = "ucbcomedy.com"

export class GoogleSignInError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GoogleSignInError"
  }
}

export interface VerifiedGoogleUser {
  email: string
  emailVerified: boolean
  hd?: string
  name?: string
  sub: string
}

export function getAllowedDomain(): string {
  return env.UCB_ALLOWED_EMAIL_DOMAIN || DEFAULT_ALLOWED_DOMAIN
}

export function isAllowedEmail(email: string, allowedDomain: string = getAllowedDomain()): boolean {
  if (!email) return false
  const idx = email.lastIndexOf("@")
  if (idx <= 0) return false
  const domain = email.slice(idx + 1).toLowerCase()
  return domain === allowedDomain.toLowerCase()
}

export function hasGoogleSignInConfig(): boolean {
  return !!(
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    env.GOOGLE_SIGNIN_REDIRECT_URI
  )
}

function getSignInClient() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_SIGNIN_REDIRECT_URI) {
    throw new GoogleSignInError(
      "Google sign-in is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_SIGNIN_REDIRECT_URI.",
    )
  }
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_SIGNIN_REDIRECT_URI,
  )
}

export function getSignInAuthUrl(state: string): string {
  const client = getSignInClient()
  const allowedDomain = getAllowedDomain()
  return client.generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    state,
    // hd narrows the chooser to the workspace domain. Server still re-verifies.
    hd: allowedDomain,
    prompt: "select_account",
  })
}

export async function verifySignInCode(code: string): Promise<VerifiedGoogleUser> {
  const client = getSignInClient()
  const { tokens } = await client.getToken(code)
  const idToken = tokens.id_token
  if (!idToken) {
    throw new GoogleSignInError("No id_token returned from Google")
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload) {
    throw new GoogleSignInError("Empty id_token payload")
  }
  if (!payload.email) {
    throw new GoogleSignInError("Google account has no email")
  }

  return {
    email: payload.email,
    emailVerified: !!payload.email_verified,
    hd: payload.hd,
    name: payload.name,
    sub: payload.sub,
  }
}
