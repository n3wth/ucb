"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Calendar, Clock, FolderOpen, MapPin, Monitor, ArrowLeft, Send, DollarSign } from "lucide-react"
import { EmailPreview } from "@/components/email-preview"
import type { ShowDetails } from "@/lib/types"

interface PreviewStageProps {
  showDetails: ShowDetails
  emailContent: string
  onEmailContentChange: (value: string) => void
  onBack: () => void
  onConfirm: () => void
  isConfirming: boolean
}

function formatDate(dateString: string): string {
  if (!dateString) return ""
  const date = new Date(dateString + "T00:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(timeString: string): string {
  if (!timeString) return ""
  const [hours, minutes] = timeString.split(":")
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function PreviewStage({
  showDetails,
  emailContent,
  onEmailContentChange,
  onBack,
  onConfirm,
  isConfirming,
}: PreviewStageProps) {
  const folderName = `${showDetails.showTitle} – ${showDetails.showDate}`

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">Review before confirming</h2>
        <p className="text-sm text-muted-foreground text-pretty">
          Nothing is sent or created yet. Confirm below to send the email, add the calendar event, and create the Drive folder.
        </p>
      </div>

      <EmailPreview
        showDetails={showDetails}
        emailContent={emailContent}
        onEmailContentChange={onEmailContentChange}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Event
          </CardTitle>
          <CardDescription>Will be added to the UCB shared calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Title</div>
              <div className="font-medium">{showDetails.showTitle || <span className="text-muted-foreground">—</span>}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailRow icon={<Calendar className="h-4 w-4" />} label="Date" value={formatDate(showDetails.showDate)} />
              <DetailRow icon={<Clock className="h-4 w-4" />} label="Show Time" value={formatTime(showDetails.showTime)} />
              <DetailRow icon={<MapPin className="h-4 w-4" />} label="Venue" value={showDetails.venue} />
              {showDetails.techRehearsalTime && (
                <DetailRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Tech Rehearsal"
                  value={formatTime(showDetails.techRehearsalTime)}
                />
              )}
              <DetailRow
                icon={<DollarSign className="h-4 w-4" />}
                label="Presale / Door"
                value={`$${showDetails.presaleTicketPrice.toFixed(2)} / $${showDetails.doorTicketPrice.toFixed(2)}`}
              />
              {showDetails.digitalTicket.enabled && (
                <DetailRow
                  icon={<Monitor className="h-4 w-4" />}
                  label="Digital Ticket"
                  value={`$${showDetails.digitalTicket.price.toFixed(2)}`}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Drive Folder
          </CardTitle>
          <CardDescription>Will be created inside the venue&apos;s show folder</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{showDetails.venue}</Badge>
              <span className="text-muted-foreground text-sm">/</span>
              <span className="font-medium text-sm">{folderName}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10">
        <div className="flex gap-2 rounded-xl border border-border bg-card p-3 shadow-lg">
          <Button variant="ghost" onClick={onBack} disabled={isConfirming} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to edit
          </Button>
          <Button onClick={onConfirm} disabled={isConfirming} className="flex-1">
            {isConfirming ? (
              <>
                <Spinner className="mr-2" />
                Confirming...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Confirm &amp; Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  )
}
