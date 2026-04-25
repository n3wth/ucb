import { type NextRequest, NextResponse } from "next/server"
import { lineupLogStore } from "@/lib/asssscat-lineup-log-server"
import { lineupMigrateRequestSchema } from "@/lib/schemas"

export async function POST(request: NextRequest) {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = lineupMigrateRequestSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request body"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const entries = await lineupLogStore.importMany(parsed.data.entries)
  return NextResponse.json({ entries, imported: parsed.data.entries.length })
}
