"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, X, Calendar, FolderOpen, Mail, ExternalLink, RefreshCw, AlertCircle, Plus } from "lucide-react"
import { formatShortDate } from "@/lib/format"
import type { ConfirmationResult, ShowDetails, StepStatus } from "@/lib/types"

interface ConfirmationResultsProps {
  result: ConfirmationResult
  showDetails: ShowDetails
  onReset: () => void
  onRetry: () => void
}

interface StatusItemProps {
  label: string
  description?: string
  status: StepStatus
  icon: React.ReactNode
  actionUrl?: string
  actionLabel?: string
  error?: string
}

function StatusItem({ label, description, status, icon, actionUrl, actionLabel, error }: StatusItemProps) {
  return (
    <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-3 transition-all hover:bg-muted/50">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-full shrink-0 transition-colors ${
              status === "success"
                ? "bg-success/15 text-success"
                : status === "error"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-muted/80 text-muted-foreground"
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm text-foreground">{label}</div>
            {description && <div className="text-xs text-muted-foreground truncate">{description}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === "pending" && (
            <Badge variant="secondary" className="font-normal text-xs bg-muted/60">
              <Spinner className="h-3 w-3 mr-1.5" />
              Working...
            </Badge>
          )}
          {status === "success" && (
            <Badge className="bg-success/15 text-success border-success/30 font-normal text-xs">
              <Check className="h-3 w-3 mr-1" />
              Done
            </Badge>
          )}
          {status === "error" && (
            <Badge className="bg-destructive/15 text-destructive border-destructive/30 font-normal text-xs">
              <X className="h-3 w-3 mr-1" />
              Failed
            </Badge>
          )}
          {status === "success" && actionUrl && (
            <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs hover:bg-muted/50">
              <a href={actionUrl} target="_blank" rel="noopener noreferrer">
                {actionLabel}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
      {status === "error" && error && (
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2 break-words">
          {error}
        </div>
      )}
    </div>
  )
}

export function ConfirmationResults({ result, showDetails, onReset, onRetry }: ConfirmationResultsProps) {
  const statuses = [result.email.status, result.calendarEvent.status, result.driveFolder.status]
  const anyPending = statuses.includes("pending")
  const anyError = statuses.includes("error")
  const allSuccess = statuses.every((s) => s === "success")

  const [showConfetti, setShowConfetti] = useState(false)
  const fired = useRef(false)
  useEffect(() => {
    if (!allSuccess || fired.current) return
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return
    }
    fired.current = true
    setShowConfetti(true)
    const t = setTimeout(() => setShowConfetti(false), 1100)
    return () => clearTimeout(t)
  }, [allSuccess])

  return (
    <Card className="relative w-full border-border">
      {showConfetti && (
        <div className="confetti" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-lg font-medium text-foreground">
              {anyPending ? "Confirming..." : allSuccess ? "Confirmed" : "Needs attention"}
            </CardTitle>
            <CardDescription className="text-sm">
              {showDetails.showTitle} &middot; {formatShortDate(showDetails.showDate)}
            </CardDescription>
          </div>
          <div
            className={`p-3 rounded-full shrink-0 transition-all ${
              anyPending
                ? "bg-muted/80"
                : allSuccess
                  ? "bg-success/15"
                  : "bg-destructive/15"
            }`}
          >
            {anyPending ? (
              <Spinner className="h-6 w-6" />
            ) : allSuccess ? (
              <Check className="h-6 w-6 text-success" />
            ) : (
              <AlertCircle className="h-6 w-6 text-destructive" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <StatusItem
            label="Confirmation email"
            description={`Sent to ${showDetails.producerEmail}`}
            status={result.email.status}
            icon={<Mail className="h-4 w-4" />}
            error={result.email.error}
          />
          <StatusItem
            label="Calendar event"
            description={`${showDetails.venue} shared calendar`}
            status={result.calendarEvent.status}
            icon={<Calendar className="h-4 w-4" />}
            actionUrl={result.calendarEvent.url}
            actionLabel="Open"
            error={result.calendarEvent.error}
          />
          <StatusItem
            label="Drive folder"
            description={`${showDetails.showTitle} - ${showDetails.showDate}`}
            status={result.driveFolder.status}
            icon={<FolderOpen className="h-4 w-4" />}
            actionUrl={result.driveFolder.url}
            actionLabel="Open"
            error={result.driveFolder.error}
          />
        </div>

        {anyError && !anyPending && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm font-medium">Some steps need attention</AlertTitle>
            <AlertDescription className="text-xs">
              You can retry to complete the failed steps, or start fresh with a new show.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-1">
          {anyError && !anyPending && (
            <Button onClick={onRetry} className="flex-1 h-10">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          <Button
            onClick={onReset}
            variant={anyError ? "outline" : "default"}
            className="flex-1 h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Start new
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
