import { NextRequest, NextResponse } from "next/server"
import { getTokensFromCode } from "@/lib/google"

// GET /api/auth/callback/google - Handle OAuth callback
// On success, renders a one-time page showing the refresh token so it can be
// pasted into the GOOGLE_REFRESH_TOKEN env var. This is a pragmatic
// single-tenant setup (no DB).
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    console.log("[v0] oauth callback: error param", error)
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code) {
    console.log("[v0] oauth callback: no code")
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  try {
    const tokens = await getTokensFromCode(code)
    console.log("[v0] oauth callback: tokens received", {
      hasAccess: !!tokens.access_token,
      hasRefresh: !!tokens.refresh_token,
      scope: tokens.scope,
    })

    const refreshToken = tokens.refresh_token
    if (!refreshToken) {
      const html = renderPage(
        "No refresh token returned",
        `Google did not return a refresh token. This usually means this Google account has already granted access.
        Revoke access at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">myaccount.google.com/permissions</a>
        and try again.`,
        null,
      )
      return new NextResponse(html, { headers: { "content-type": "text/html" } })
    }

    const html = renderPage(
      "Google connected",
      "Copy the refresh token below and paste it into the <code>GOOGLE_REFRESH_TOKEN</code> environment variable in your Vercel project. Then redeploy.",
      refreshToken,
    )
    return new NextResponse(html, { headers: { "content-type": "text/html" } })
  } catch (err: any) {
    const detail = err?.response?.data || err?.message || String(err)
    console.log("[v0] oauth callback: token exchange failed", detail)
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url))
  }
}

function renderPage(title: string, description: string, token: string | null): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fafafa; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
    .card { max-width: 560px; width: 100%; background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 32px; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    p { color: #a3a3a3; line-height: 1.55; margin: 0 0 16px; }
    code { background: #262626; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .token { background: #0a0a0a; border: 1px solid #262626; padding: 12px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; word-break: break-all; color: #fafafa; margin-bottom: 12px; }
    a.btn { display: inline-block; background: #fafafa; color: #0a0a0a; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px; }
    a.link { color: #fafafa; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${description}</p>
    ${token ? `<div class="token">${escapeHtml(token)}</div>` : ""}
    <a class="btn" href="/">Back to app</a>
  </div>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
