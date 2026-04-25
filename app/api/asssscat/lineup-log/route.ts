import { type NextRequest, NextResponse } from "next/server"
import { lineupLogStore } from "@/lib/asssscat-lineup-log-server"
import { lineupEntryUpsertSchema } from "@/lib/schemas"

export async function GET() {
  const entries = await lineupLogStore.list()
  return NextResponse.json({ entries })
}

export async function POST(request: NextRequest) {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = lineupEntryUpsertSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request body"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { dedupe, ...entry } = parsed.data
  const entries = dedupe
    ? await lineupLogStore.recordIfNew(entry)
    : await lineupLogStore.upsert(entry)

  return NextResponse.json({ entries })
}
