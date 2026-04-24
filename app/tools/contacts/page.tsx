import { ContactsApp } from "@/components/contacts-app"
import { getToolMeta } from "@/lib/tools"

export const dynamic = "force-dynamic"

export const metadata = getToolMeta("contacts")

export default function ContactsPage() {
  return <ContactsApp />
}
