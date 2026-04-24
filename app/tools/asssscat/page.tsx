import { AsssscatApp } from "@/components/asssscat-app"
import { getToolMeta } from "@/lib/tools"

export const dynamic = "force-dynamic"

export const metadata = getToolMeta("asssscat")

export default function AsssscatPage() {
  return <AsssscatApp />
}
