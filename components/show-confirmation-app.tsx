"use client"

import { useState } from "react"
import { ShowConfirmationForm } from "@/components/show-confirmation-form"
import { PreviewStage } from "@/components/preview-stage"
import { ConfirmationResults } from "@/components/confirmation-results"
import { StageProgress } from "@/components/stage-progress"
import { ToolPage } from "@/components/tool-page"
import { renderShowConfirmationBody, renderShowConfirmationSubject } from "@/lib/emails"
import type { ShowDetails, ConfirmationResult } from "@/lib/types"

type Stage = "compose" | "preview" | "result"

const PENDING_RESULT: ConfirmationResult = {
  email: { status: "pending" },
  calendarEvent: { status: "pending" },
  driveFolder: { status: "pending" },
}

export function ShowConfirmationApp() {
  const [stage, setStage] = useState<Stage>("compose")
  const [showDetails, setShowDetails] = useState<ShowDetails | null>(null)
  const [emailContent, setEmailContent] = useState<string>("")
  const [result, setResult] = useState<ConfirmationResult | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleComposeSubmit = (data: ShowDetails) => {
    setShowDetails(data)
    setEmailContent(renderShowConfirmationBody({ showDetails: data }))
    setStage("preview")
  }

  const handleConfirm = async () => {
    if (!showDetails) return
    setIsConfirming(true)
    const pending: ConfirmationResult = {
      ...PENDING_RESULT,
      ...(showDetails.techRehearsal.enabled
        ? { techRehearsalEvent: { status: "pending" } }
        : {}),
    }
    setResult(pending)
    setStage("result")

    try {
      const response = await fetch("/api/confirm-show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...showDetails,
          emailSubject: renderShowConfirmationSubject(showDetails),
          emailBody: emailContent,
        }),
      })

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After")) || 10
        const msg = `Too many requests. Please wait ${retryAfter}s and try again.`
        setResult({
          email: { status: "error", error: msg },
          calendarEvent: { status: "error", error: msg },
          driveFolder: { status: "error", error: msg },
          ...(showDetails.techRehearsal.enabled
            ? { techRehearsalEvent: { status: "error", error: msg } }
            : {}),
        })
        return
      }

      const data = (await response.json()) as ConfirmationResult
      setResult(data)

      if (data.driveFolder.status === "success" && data.driveFolder.url) {
        setEmailContent(renderShowConfirmationBody({ showDetails, driveFolderUrl: data.driveFolder.url }))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error"
      setResult({
        email: { status: "error", error: msg },
        calendarEvent: { status: "error", error: msg },
        driveFolder: { status: "error", error: msg },
        ...(showDetails.techRehearsal.enabled
          ? { techRehearsalEvent: { status: "error", error: msg } }
          : {}),
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
    <ToolPage
      title="Show Confirmation"
      description="Confirm a show in one form. Sends the producer email, adds the calendar event, and creates the Drive folder."
    >
      <div className="flex flex-col items-center gap-10">
        <StageProgress current={stage} />

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
    </ToolPage>
  )
}
