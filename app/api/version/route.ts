import { NextResponse } from "next/server"
import { execSync } from "node:child_process"

function resolveSha(): string {
  const fromEnv =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GIT_COMMIT_SHA ??
    process.env.GITHUB_SHA
  if (fromEnv) return fromEnv
  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim()
  } catch {
    return "unknown"
  }
}

const sha = resolveSha()
const buildTime = new Date().toISOString()

export async function GET() {
  return NextResponse.json({
    sha,
    buildTime,
  })
}
