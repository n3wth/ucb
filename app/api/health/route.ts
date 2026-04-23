import { NextResponse } from "next/server"

const startedAt = Date.now()
const version = process.env.npm_package_version ?? "0.0.0"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version,
    uptime: (Date.now() - startedAt) / 1000,
  })
}
