import { AuditLogApp } from "@/components/audit-log-app"
import { getToolMeta } from "@/lib/tools"

export const dynamic = "force-dynamic"

export const metadata = getToolMeta("audit")

export default function AuditPage() {
  return <AuditLogApp />
}
