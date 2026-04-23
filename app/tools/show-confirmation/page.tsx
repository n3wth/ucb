import type { Metadata } from "next"
import { ShowConfirmationApp } from "@/components/show-confirmation-app"
import { getToolMeta } from "@/lib/tools"

export const dynamic = "force-dynamic"

export const metadata: Metadata = getToolMeta("show-confirmation") as Metadata

export default function ShowConfirmationPage() {
  return <ShowConfirmationApp />
}
