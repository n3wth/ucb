import { EmailTemplateSettings } from "@/components/email-template-settings"
import { getToolMeta } from "@/lib/tools"

export const dynamic = "force-dynamic"

export const metadata = getToolMeta("settings")

export default function SettingsPage() {
  return <EmailTemplateSettings />
}
