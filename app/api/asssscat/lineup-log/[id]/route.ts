import { type NextRequest, NextResponse } from "next/server"
import { lineupLogStore } from "@/lib/asssscat-lineup-log-server"

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }
  const entries = await lineupLogStore.remove(id)
  return NextResponse.json({ entries })
}
