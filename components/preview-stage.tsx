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
    <div className="w-full max-w-2xl space-y-5">
      <div className="space-y-2 text-center">
        <h2 className="font-display text-xl uppercase tracking-wider text-balance">
          Review Before Confirming
        </h2>
        <p className="text-sm text-muted-foreground text-pretty max-w-md mx-auto">
          Nothing is sent or created yet. Confirm below to send the email, add the calendar event, and create the Drive folder.
        </p>
      </div>

      <EmailPreview
        showDetails={showDetails}
        emailContent={emailContent}
        onEmailContentChange={onEmailContentChange}
      />

      <Card className="shadow-lg shadow-black/10 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Calendar Event
          </CardTitle>
          <CardDescription className="text-xs">Will be added to the UCB shared calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Event Title</div>
              <div className="font-medium">{showDetails.showTitle || <span className="text-muted-foreground">-</span>}</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Date" value={formatDate(showDetails.showDate)} />
              <DetailRow icon={<Clock className="h-3.5 w-3.5" />} label="Time" value={formatTime(showDetails.showTime)} />
              <DetailRow icon={<MapPin className="h-3.5 w-3.5" />} label="Venue" value={showDetails.venue} />
              {showDetails.techRehearsalTime && (
                <DetailRow
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Tech"
                  value={formatTime(showDetails.techRehearsalTime)}
                />
              )}
              <DetailRow
                icon={<DollarSign className="h-3.5 w-3.5" />}
                label="Tickets"
                value={`${formatPrice(showDetails.presaleTicketPrice)} / ${formatPrice(showDetails.doorTicketPrice)}`}
              />
              {showDetails.digitalTicket.enabled && (
                <DetailRow
                  icon={<Monitor className="h-3.5 w-3.5" />}
                  label="Digital"
                  value={formatPrice(showDetails.digitalTicket.price)}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg shadow-black/10 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            Drive Folder
          </CardTitle>
          <CardDescription className="text-xs">Will be created inside the venue&apos;s show folder</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <Badge variant="secondary" className="font-normal text-xs">
              {showDetails.venue}
            </Badge>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{folderName}</span>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10">
        <div className="flex gap-3 rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 shadow-xl shadow-black/20">
          <Button variant="ghost" onClick={onBack} disabled={isConfirming} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex-1 font-display uppercase tracking-wider text-sm"
          >
            {isConfirming ? (
              <>
                <Spinner className="mr-2" />
                Confirming...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Confirm
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
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium truncate">{value || <span className="text-muted-foreground">-</span>}</div>
    </div>
  )
}
