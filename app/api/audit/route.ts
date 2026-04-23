import { NextResponse } from "next/server"
import { audit, AUDIT_MAX_ENTRIES } from "@/lib/audit"

export async function GET() {
  return NextResponse.json({ entries: audit.list(AUDIT_MAX_ENTRIES) })
}
