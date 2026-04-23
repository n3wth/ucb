import { NextResponse } from "next/server"
import { env } from "@/lib/env"

// GET /api/auth/status - Check if Google OAuth is configured
export async function GET() {
  const hasCredentials = !!(
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    env.GOOGLE_REFRESH_TOKEN
  )

  return NextResponse.json({
    connected: hasCredentials,
    hasClientId: !!env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!env.GOOGLE_CLIENT_SECRET,
    hasRefreshToken: !!env.GOOGLE_REFRESH_TOKEN,
  })
}
