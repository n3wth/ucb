import { NextResponse } from "next/server"
import { getAuthUrl } from "@/lib/google"

// GET /api/auth/google - Redirect to Google OAuth
export async function GET() {
  const authUrl = getAuthUrl()
  return NextResponse.redirect(authUrl)
}
