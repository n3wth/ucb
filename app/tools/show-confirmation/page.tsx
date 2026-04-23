import type { Metadata } from "next"
import { AppHeader } from "@/components/app-header"
import { ShowConfirmationApp } from "@/components/show-confirmation-app"
import { getToolById } from "@/lib/tools"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Show Confirmation",
}

export default function ShowConfirmationPage() {
  const tool = getToolById("show-confirmation")

  return (
    <main className="min-h-screen bg-background bg-grain">
      <AppHeader toolName={tool?.name} />
      <div className="container mx-auto px-6 py-10 sm:py-14">
        <ShowConfirmationApp />
      </div>
    </main>
  )
}
