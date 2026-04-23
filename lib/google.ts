import { google } from "googleapis"

// Google OAuth2 configuration
// Users need to set these environment variables:
// - GOOGLE_CLIENT_ID: OAuth client ID from Google Cloud Console
// - GOOGLE_CLIENT_SECRET: OAuth client secret from Google Cloud Console
// - GOOGLE_REDIRECT_URI: The callback URL (e.g., http://localhost:3000/api/auth/callback/google)
// - GOOGLE_REFRESH_TOKEN: Refresh token obtained during initial OAuth flow

export function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  // If we have a refresh token, set it
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    })
  }

  return oauth2Client
}

export function getCalendarClient() {
  const auth = getOAuth2Client()
  return google.calendar({ version: "v3", auth })
}

export function getDriveClient() {
  const auth = getOAuth2Client()
  return google.drive({ version: "v3", auth })
}

export function getGmailClient() {
  const auth = getOAuth2Client()
  return google.gmail({ version: "v1", auth })
}

// Generate the OAuth authorization URL for initial setup
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
    prompt: "consent", // Force consent to get refresh token
  })
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}
