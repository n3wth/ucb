"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShowConfirmationForm } from "@/components/show-confirmation-form"
import { PreviewStage } from "@/components/preview-stage"
import { ConfirmationResults } from "@/components/confirmation-results"
import { StageProgress } from "@/components/stage-progress"
import { Button } from "@/components/ui/button"
import { LogOut, Theater } from "lucide-react"
import { generateEmailContent } from "@/components/email-preview"
import type { ShowDetails, ConfirmationResult } from "@/lib/types"

type Stage = "compose" | "preview" | "result"

const PENDING_RESULT: ConfirmationResult = {
  email: { status: "pending" },
  calendarEvent: { status: "pending" },
  driveFolder: { status: "pending" },
}

export default function Home() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>("compose")
  const [showDetails, setShowDetails] = useState<ShowDetails | null>(null)
  const [emailContent, setEmailContent] = useState<string>("")
  const [result, setResult] = useState<ConfirmationResult | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleComposeSubmit = (data: ShowDetails) => {
    setShowDetails(data)
    setEmailContent(generateEmailContent(data))
    setStage("preview")
  }

  const handleConfirm = async () => {
    if (!showDetails) return
    setIsConfirming(true)
    setResult(PENDING_RESULT)
    setStage("result")

    try {
      const response = await fetch("/api/confirm-show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(showDetails),
      })
      const data = (await response.json()) as ConfirmationResult
      setResult(data)

      // If drive folder succeeded, update email to include the link
      if (data.driveFolder.status === "success" && data.driveFolder.url) {
        setEmailContent(generateEmailContent(showDetails, data.driveFolder.url))
      }
    } catch (err: any) {
      const msg = err?.message || "Network error"
      setResult({
        email: { status: "error", error: msg },
        calendarEvent: { status: "error", error: msg },
        driveFolder: { status: "error", error: msg },
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const handleBackToCompose = () => {
    setStage("compose")
  }

  const handleReset = () => {
    setShowDetails(null)
    setResult(null)
    setEmailContent("")
    setStage("compose")
  }

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Theater className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold leading-none">UCB Show Confirmation</div>
              <div className="text-xs text-muted-foreground mt-1">Every show, confirmed in 300 clicks.</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          <StageProgress current={stage} />

          {stage === "compose" && (
            <ShowConfirmationForm initialValue={showDetails} onSubmit={handleComposeSubmit} />
          )}

          {stage === "preview" && showDetails && (
            <PreviewStage
              showDetails={showDetails}
              emailContent={emailContent}
              onEmailContentChange={setEmailContent}
              onBack={handleBackToCompose}
              onConfirm={handleConfirm}
              isConfirming={isConfirming}
            />
          )}

          {stage === "result" && showDetails && result && (
            <ConfirmationResults
              result={result}
              showDetails={showDetails}
              onReset={handleReset}
              onRetry={handleConfirm}
            />
          )}
        </div>
      </div>
    </main>
  )
}
