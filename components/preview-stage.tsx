"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Calendar, Clock, FolderOpen, MapPin, Monitor, ArrowLeft, Send, DollarSign } from "lucide-react"
import { EmailPreview } from "@/components/email-preview"
import { formatDate, formatTime, formatPrice, formatDuration } from "@/lib/format"
import type { ShowDetails } from "@/lib/types"

interface PreviewStageProps {
  showDetails: ShowDetails
  emailContent: string
  onEmailContentChange: (value: string) => void
  onBack: () => void
  onConfirm: () => void
  isConfirming: boolean
}

export function PreviewStage({
  showDetails,
  emailContent,
  onEmailContentChange,
  onBack,
  onConfirm,
  isConfirming,
}: PreviewStageProps) {
  const folderName = `${showDetails.showTitle} - ${showDetails.showDate}`

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-lg font-medium text-foreground">Review &amp; confirm</h2>
        <p className="text-sm text-muted-foreground max-w-lg">
          Nothing is created until you confirm. Review the email, calendar event, and Drive folder below.
        </p>
      </div>

      {/* Email preview */}
      <EmailPreview
        showDetails={showDetails}
        emailContent={emailContent}
        onEmailContentChange={onEmailContentChange}
      />

      {/* Calendar event card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Calendar event
          </CardTitle>
          <CardDescription className="text-xs">Will be added to the shared UCB calendar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Event title</div>
              <div className="font-medium text-foreground">{showDetails.showTitle || <span className="text-muted-foreground">-</span>}</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <DetailItem icon={<Calendar className="h-3.5 w-3.5" />} label="Date" value={formatDate(showDetails.showDate)} />
              <DetailItem icon={<Clock className="h-3.5 w-3.5" />} label="Time" value={formatTime(showDetails.showTime)} />
              <DetailItem icon={<MapPin className="h-3.5 w-3.5" />} label="Venue" value={showDetails.venue} />
              {showDetails.techRehearsalTime && (
                <DetailItem icon={<Clock className="h-3.5 w-3.5" />} label="Tech" value={formatTime(showDetails.techRehearsalTime)} />
              )}
              <DetailItem
                icon={<DollarSign className="h-3.5 w-3.5" />}
                label="Tickets"
                value={`${formatPrice(showDetails.presaleTicketPrice)} / ${formatPrice(showDetails.doorTicketPrice)}`}
              />
              {showDetails.digitalTicket.enabled && (
                <DetailItem icon={<Monitor className="h-3.5 w-3.5" />} label="Digital" value={formatPrice(showDetails.digitalTicket.price)} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech rehearsal event card */}
      {showDetails.techRehearsal.enabled && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Tech rehearsal event
            </CardTitle>
            <CardDescription className="text-xs">
              Separate calendar event for the tech rehearsal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Event title</div>
                <div className="font-medium text-foreground">
                  {showDetails.showTitle ? `${showDetails.showTitle} - TECH` : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <DetailItem
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Date"
                  value={formatDate(showDetails.techRehearsal.date)}
                />
                <DetailItem
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Start"
                  value={formatTime(showDetails.techRehearsal.time)}
                />
                <DetailItem
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Duration"
                  value={formatDuration(showDetails.techRehearsal.durationMinutes)}
                />
                <DetailItem icon={<MapPin className="h-3.5 w-3.5" />} label="Venue" value={showDetails.venue} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drive folder card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            Drive folder
          </CardTitle>
          <CardDescription className="text-xs">Will be created in the venue&apos;s Google Drive.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <Badge variant="secondary" className="font-normal text-xs">
              {showDetails.venue}
            </Badge>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{folderName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action bar */}
      <div className="sticky bottom-4 z-10 pt-2">
        <div className="flex gap-2 rounded-lg border border-border bg-card shadow-lg p-2">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isConfirming}
            className="flex-1 h-10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex-1 h-10"
          >
            {isConfirming ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Confirming...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Confirm show
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
        <span className="opacity-70">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-medium truncate text-foreground">{value || <span className="text-muted-foreground">-</span>}</div>
    </div>
  )
}
