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

  const result = await lineupLogStore.importMany(parsed.data.entries)

  // If the import only landed in per-instance memory, refuse to acknowledge
  // success — otherwise the client will mark its localStorage as migrated and
  // the legacy entries are lost forever once that browser opens a different
  // serverless instance with an empty in-memory store.
  if (!result.persisted) {
    return NextResponse.json(
      {
        error:
          "lineup-log storage unavailable; legacy entries were not migrated",
        entries: result.entries,
        imported: 0,
      },
      { status: 503 },
    )
  }

  return NextResponse.json({
    entries: result.entries,
    imported: parsed.data.entries.length,
  })
}
