/**
 * Tools registry — the single source of truth for every internal tool.
 *
 * To add a new tool:
 *   1. Create `app/tools/<id>/page.tsx` (use <ToolPage> for the shell).
 *   2. Add an entry below with a matching `href`.
 *
 * The hub page, header breadcrumb, and page metadata will pick it up
 * automatically — nothing else to wire.
 */

import type { LucideIcon } from "lucide-react"
import { CalendarCheck } from "lucide-react"

export type ToolStatus = "available" | "coming-soon"

export interface Tool {
  id: string
  name: string
  description: string
  href: string
  icon: LucideIcon
  status: ToolStatus
}

export const TOOLS: Tool[] = [
  {
    id: "show-confirmation",
    name: "Show Confirmation",
    description:
      "Confirm a show in one form. Sends the producer email, adds the calendar event, and creates the Drive folder.",
    href: "/tools/show-confirmation",
    icon: CalendarCheck,
    status: "available",
  },
]

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id)
}

/**
 * Next.js metadata derived from the registry.
 * Use as: `export const metadata = getToolMeta("show-confirmation")`
 */
export function getToolMeta(id: string): { title: string; description: string } | undefined {
  const tool = getToolById(id)
  if (!tool) return undefined
  return { title: tool.name, description: tool.description }
}
