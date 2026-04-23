"use client"

import { useState } from "react"
import { ShowConfirmationForm } from "@/components/show-confirmation-form"
import { PreviewStage } from "@/components/preview-stage"
import { ConfirmationResults } from "@/components/confirmation-results"
import { StageProgress } from "@/components/stage-progress"
import { AppHeader } from "@/components/app-header"
import { generateEmailContent } from "@/components/email-preview"
import type { ShowDetails, ConfirmationResult } from "@/lib/types"

type Stage = "compose" | "preview" | "result"

const PENDING_RESULT: ConfirmationResult = {
  email: { status: "pending" },
  calendarEvent: { status: "pending" },
  driveFolder: { status: "pending" },
}

function buildSubject(d: ShowDetails): string {
  return `Your show at ${d.venue} is confirmed - ${d.showTitle}`
}

export default function Home() {
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
        body: JSON.stringify({
          ...showDetails,
          emailSubject: buildSubject(showDetails),
          emailBody: emailContent,
        }),
      })
      const data = (await response.json()) as ConfirmationResult
      setResult(data)

      if (data.driveFolder.status === "success" && data.driveFolder.url) {
        setEmailContent(generateEmailContent(showDetails, data.driveFolder.url))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error"
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

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center gap-10 max-w-2xl mx-auto">
          {/* Progress indicator */}
          <StageProgress current={stage} />

          {/* Stage content */}
          <div className="w-full">
            {stage === "compose" && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
                <ShowConfirmationForm initialValue={showDetails} onSubmit={handleComposeSubmit} />
              </div>
            )}

            {stage === "preview" && showDetails && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
                <PreviewStage
                  showDetails={showDetails}
                  emailContent={emailContent}
                  onEmailContentChange={setEmailContent}
                  onBack={handleBackToCompose}
                  onConfirm={handleConfirm}
                  isConfirming={isConfirming}
                />
              </div>
            )}

            {stage === "result" && showDetails && result && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
                <ConfirmationResults
                  result={result}
                  showDetails={showDetails}
                  onReset={handleReset}
                  onRetry={handleConfirm}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
