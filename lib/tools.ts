/**
 * Tools registry.
 *
 * Adding a new tool to UCB Bookings is as simple as:
 *   1. Create a new route under `app/tools/<id>/page.tsx`
 *   2. Add an entry below with matching `id`
 *
 * The tools hub and navigation will pick it up automatically.
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
  /** Short eyebrow label shown above the card title, e.g. "Bookings" */
  category: string
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
    category: "Bookings",
  },
]

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id)
}
