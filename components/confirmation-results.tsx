"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Calendar, FolderOpen, Mail, ExternalLink, RefreshCw } from "lucide-react"
import type { ConfirmationResult, ShowDetails } from "@/lib/types"

interface ConfirmationResultsProps {
  result: ConfirmationResult
  showDetails: ShowDetails
  onReset: () => void
}

interface StatusItemProps {
  label: string
  success: boolean
  icon: React.ReactNode
  actionUrl?: string
  actionLabel?: string
}

function StatusItem({ label, success, icon, actionUrl, actionLabel }: StatusItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {success ? (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
            <X className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )}
        {actionUrl && (
          <Button variant="ghost" size="sm" asChild>
            <a href={actionUrl} target="_blank" rel="noopener noreferrer">
              {actionLabel}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

export function ConfirmationResults({ result, showDetails, onReset }: ConfirmationResultsProps) {
  const allSuccess = result.emailGenerated && result.calendarEventCreated && result.driveFolderCreated

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl text-balance">
              {allSuccess ? "Confirmation Complete" : "Confirmation Partially Complete"}
            </CardTitle>
            <CardDescription className="text-pretty">
              Show: {showDetails.showTitle}
            </CardDescription>
          </div>
          {allSuccess ? (
            <div className="p-3 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          ) : (
            <div className="p-3 rounded-full bg-amber-100">
              <X className="h-6 w-6 text-amber-600" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <StatusItem
            label="Confirmation Email Generated"
            success={result.emailGenerated}
            icon={<Mail className="h-4 w-4" />}
          />
          <StatusItem
            label="Google Calendar Event Created"
            success={result.calendarEventCreated}
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatusItem
            label="Google Drive Folder Created"
            success={result.driveFolderCreated}
            icon={<FolderOpen className="h-4 w-4" />}
            actionUrl={result.driveFolderUrl}
            actionLabel="Open Folder"
          />
        </div>

        {result.errors && result.errors.length > 0 && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Errors</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {result.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={onReset} variant="outline" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Create Another Confirmation
        </Button>
      </CardContent>
    </Card>
  )
}
