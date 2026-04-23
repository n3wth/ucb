"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, X, Calendar, FolderOpen, Mail, ExternalLink, RefreshCw, AlertCircle } from "lucide-react"
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
    <div className="p-3 rounded-lg border border-border bg-card space-y-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2 rounded-full shrink-0 ${
              status === "success"
                ? "bg-emerald-100 text-emerald-700"
                : status === "error"
                  ? "bg-red-100 text-red-700"
                  : status === "pending"
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted text-muted-foreground"
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{label}</div>
            {description && <div className="text-xs text-muted-foreground truncate">{description}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === "pending" && (
            <Badge variant="secondary" className="font-normal">
              <Spinner className="h-3 w-3 mr-1.5" />
              Working...
            </Badge>
          )}
          {status === "success" && (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <Check className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
          {status === "error" && (
            <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
              <X className="h-3 w-3 mr-1" />
              Failed
            </Badge>
          )}
          {status === "success" && actionUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={actionUrl} target="_blank" rel="noopener noreferrer">
                {actionLabel}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
      {status === "error" && error && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5 break-words">
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

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl text-balance">
              {anyPending
                ? "Confirming show..."
                : allSuccess
                  ? "Show confirmed"
                  : anyError
                    ? "Some steps failed"
                    : "Ready"}
            </CardTitle>
            <CardDescription className="text-pretty">{showDetails.showTitle}</CardDescription>
          </div>
          <div
            className={`p-3 rounded-full shrink-0 ${
              anyPending
                ? "bg-muted"
                : allSuccess
                  ? "bg-emerald-100"
                  : anyError
                    ? "bg-red-100"
                    : "bg-muted"
            }`}
          >
            {anyPending ? (
              <Spinner className="h-6 w-6" />
            ) : allSuccess ? (
              <Check className="h-6 w-6 text-emerald-700" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-700" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <StatusItem
            label="Confirmation email"
            description={`Ready to send to ${showDetails.producerEmail}`}
            status={result.email.status}
            icon={<Mail className="h-4 w-4" />}
            error={result.email.error}
          />
          <StatusItem
            label="Calendar event"
            description={`${showDetails.venue} · ${showDetails.showDate}`}
            status={result.calendarEvent.status}
            icon={<Calendar className="h-4 w-4" />}
            actionUrl={result.calendarEvent.url}
            actionLabel="Open event"
            error={result.calendarEvent.error}
          />
          <StatusItem
            label="Drive folder"
            description={`${showDetails.showTitle} – ${showDetails.showDate}`}
            status={result.driveFolder.status}
            icon={<FolderOpen className="h-4 w-4" />}
            actionUrl={result.driveFolder.url}
            actionLabel="Open folder"
            error={result.driveFolder.error}
          />
        </div>

        {anyError && !anyPending && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>One or more steps failed</AlertTitle>
            <AlertDescription>
              You can retry the full confirmation or go back to review and fix the details.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {anyError && !anyPending && (
            <Button onClick={onRetry} variant="default" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          <Button onClick={onReset} variant={anyError ? "outline" : "default"} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Confirm another show
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
