"use client"

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
    <div className="p-4 rounded-lg border border-border bg-card/50 space-y-2 transition-colors hover:bg-card/80">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2 rounded-full shrink-0 transition-colors ${
              status === "success"
                ? "bg-emerald-500/15 text-emerald-400"
                : status === "error"
                  ? "bg-red-500/15 text-red-400"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm">{label}</div>
            {description && <div className="text-xs text-muted-foreground truncate">{description}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === "pending" && (
            <Badge variant="secondary" className="font-normal text-xs">
              <Spinner className="h-3 w-3 mr-1.5" />
              Working...
            </Badge>
          )}
          {status === "success" && (
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-normal text-xs">
              <Check className="h-3 w-3 mr-1" />
              Done
            </Badge>
          )}
          {status === "error" && (
            <Badge className="bg-red-500/15 text-red-400 border-red-500/30 font-normal text-xs">
              <X className="h-3 w-3 mr-1" />
              Failed
            </Badge>
          )}
          {status === "success" && actionUrl && (
            <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
              <a href={actionUrl} target="_blank" rel="noopener noreferrer">
                {actionLabel}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
      {status === "error" && error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2 break-words">
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
    <Card className="w-full max-w-2xl shadow-xl shadow-black/20 border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="font-display text-xl uppercase tracking-wider text-balance">
              {anyPending
                ? "Confirming..."
                : allSuccess
                  ? "Confirmed"
                  : "Partially Failed"}
            </CardTitle>
            <CardDescription className="text-sm">
              {showDetails.showTitle} &middot; {formatShortDate(showDetails.showDate)}
            </CardDescription>
          </div>
          <div
            className={`p-3 rounded-full shrink-0 transition-colors ${
              anyPending
                ? "bg-muted"
                : allSuccess
                  ? "bg-emerald-500/15"
                  : "bg-red-500/15"
            }`}
          >
            {anyPending ? (
              <Spinner className="h-6 w-6" />
            ) : allSuccess ? (
              <Check className="h-6 w-6 text-emerald-400" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-400" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <StatusItem
            label="Confirmation Email"
            description={`Sent to ${showDetails.producerEmail}`}
            status={result.email.status}
            icon={<Mail className="h-4 w-4" />}
            error={result.email.error}
          />
          <StatusItem
            label="Calendar Event"
            description={`${showDetails.venue} shared calendar`}
            status={result.calendarEvent.status}
            icon={<Calendar className="h-4 w-4" />}
            actionUrl={result.calendarEvent.url}
            actionLabel="Open"
            error={result.calendarEvent.error}
          />
          <StatusItem
            label="Drive Folder"
            description={`${showDetails.showTitle} - ${showDetails.showDate}`}
            status={result.driveFolder.status}
            icon={<FolderOpen className="h-4 w-4" />}
            actionUrl={result.driveFolder.url}
            actionLabel="Open"
            error={result.driveFolder.error}
          />
        </div>

        {anyError && !anyPending && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm font-medium">Some steps failed</AlertTitle>
            <AlertDescription className="text-xs">
              You can retry the confirmation or start fresh with a new show.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-2">
          {anyError && !anyPending && (
            <Button onClick={onRetry} className="flex-1 font-display uppercase tracking-wider text-xs">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          <Button
            onClick={onReset}
            variant={anyError ? "outline" : "default"}
            className={`flex-1 ${!anyError ? "font-display uppercase tracking-wider text-xs" : ""}`}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Show
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
