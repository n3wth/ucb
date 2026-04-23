import { ShowConfirmationApp } from "@/components/show-confirmation-app"
import { getToolMeta } from "@/lib/tools"

export const dynamic = "force-dynamic"

export const metadata = getToolMeta("show-confirmation")

export default function ShowConfirmationPage() {
  return <ShowConfirmationApp />
}
