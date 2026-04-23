import { NextRequest, NextResponse } from "next/server"
import { getTokensFromCode } from "@/lib/google"

// GET /api/auth/callback/google - Handle OAuth callback
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  try {
    const tokens = await getTokensFromCode(code)
    
    // In production, you would store these tokens securely
    // For this prototype, we'll display them so they can be added to environment variables
    console.log("OAuth tokens received:")
    console.log("Access Token:", tokens.access_token)
    console.log("Refresh Token:", tokens.refresh_token)
    console.log("Add GOOGLE_REFRESH_TOKEN to your environment variables with the refresh token value")

    // Redirect to success page
    return NextResponse.redirect(new URL("/?auth=success", request.url))
  } catch (err) {
    console.error("Error exchanging code for tokens:", err)
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url))
  }
}
