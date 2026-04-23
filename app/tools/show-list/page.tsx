import { ShowListApp } from "@/components/show-list-app"
import { getToolMeta } from "@/lib/tools"

export const dynamic = "force-dynamic"

export const metadata = getToolMeta("show-list")

export default function ShowListPage() {
  return <ShowListApp />
}
