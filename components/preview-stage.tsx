"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Calendar, Clock, FolderOpen, MapPin, Monitor, ArrowLeft, Send, DollarSign } from "lucide-react"
import { EmailPreview } from "@/components/email-preview"
import { formatDate, formatTime, formatPrice } from "@/lib/format"
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
      <div className="text-center space-y-2">
        <h2 className="font-display text-lg uppercase tracking-wide">
          Review Before Confirming
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Nothing is sent or created yet. Confirm below to send the email, create the calendar event, and set up the Drive folder.
        </p>
      </div>

      {/* Email preview */}
      <EmailPreview
        showDetails={showDetails}
        emailContent={emailContent}
        onEmailContentChange={onEmailContentChange}
      />

      {/* Calendar event card */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Calendar Event
          </CardTitle>
          <CardDescription className="text-xs">Will be added to the UCB shared calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-label mb-1">Event Title</div>
              <div className="font-medium">{showDetails.showTitle || <span className="text-muted-foreground">-</span>}</div>
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

      {/* Drive folder card */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            Drive Folder
          </CardTitle>
          <CardDescription className="text-xs">Will be created inside the venue&apos;s show folder</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <Badge variant="secondary" className="font-normal text-xs bg-muted/80">
              {showDetails.venue}
            </Badge>
            <span className="text-muted-foreground/60">/</span>
            <span className="font-medium">{folderName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action bar */}
      <div className="sticky bottom-4 z-10 pt-2">
        <div className="flex gap-3 rounded-xl border border-border/60 bg-card/95 backdrop-blur-md p-3 card-floating">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            disabled={isConfirming} 
            className="flex-1 h-11"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex-1 h-11 font-display uppercase tracking-wide text-sm"
          >
            {isConfirming ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Confirming...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Confirm Show
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
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
        <span className="opacity-60">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-medium truncate">{value || <span className="text-muted-foreground">-</span>}</div>
    </div>
  )
}
