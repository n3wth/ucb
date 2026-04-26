import type { Metadata } from "next"
import { SettingsApp } from "@/components/settings-app"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Settings",
  description: "Edit default email templates for ASSSSCAT and other tools.",
}

export default function SettingsPage() {
  return <SettingsApp />
}
