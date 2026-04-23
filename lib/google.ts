import { google, type Auth } from "googleapis"
import { env } from "./env"

// Google OAuth2 configuration
// Env vars required for live mode:
// - GOOGLE_CLIENT_ID
// - GOOGLE_CLIENT_SECRET
// - GOOGLE_REDIRECT_URI (e.g. https://www.ucbbookings.com/api/auth/callback/google)
// - GOOGLE_REFRESH_TOKEN (captured from the OAuth callback page, then pasted into env)

export class GoogleAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GoogleAuthError"
  }
}

export function hasGoogleCredentials(): boolean {
  return !!(
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    env.GOOGLE_REFRESH_TOKEN
  )
}

export function getOAuth2Client(): Auth.OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  )

  if (env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
    })
  }

  return oauth2Client
}

// Returns an OAuth2 client with a freshly-refreshed access token.
// Throws GoogleAuthError with a clear message on failure.
export async function getAuthedClient(): Promise<Auth.OAuth2Client> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new GoogleAuthError("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing")
  }
  if (!env.GOOGLE_REFRESH_TOKEN) {
    throw new GoogleAuthError(
      "GOOGLE_REFRESH_TOKEN is missing. Run the OAuth flow at /api/auth/google and paste the returned refresh token into env vars.",
    )
  }

  const client = getOAuth2Client()
  try {
    const { token, res } = await client.getAccessToken()
    console.log("[v0] google: token refreshed", {
      hasToken: !!token,
      status: res?.status,
    })
  } catch (err: any) {
    const detail = err?.response?.data || err?.message || String(err)
    console.log("[v0] google: token refresh failed", detail)
    throw new GoogleAuthError(`Failed to refresh Google access token: ${typeof detail === "string" ? detail : JSON.stringify(detail)}`)
  }
  return client
}

export async function getDrive() {
  const auth = await getAuthedClient()
  return google.drive({ version: "v3", auth })
}

export async function getCalendar() {
  const auth = await getAuthedClient()
  return google.calendar({ version: "v3", auth })
}

export async function getGmail() {
  const auth = await getAuthedClient()
  return google.gmail({ version: "v1", auth })
}

// Initial OAuth authorization URL (one-time setup)
export function getAuthUrl() {
  const oauth2Client = getOAuth2Client()
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/gmail.send",
  ]
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  })
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}
