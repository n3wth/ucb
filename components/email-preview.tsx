"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Mail, Edit2 } from "lucide-react"
import type { ShowDetails } from "@/lib/types"

interface EmailPreviewProps {
  showDetails: ShowDetails
  driveFolderUrl?: string
  emailContent: string
  onEmailContentChange: (value: string) => void
}

function formatDate(dateString: string): string {
  if (!dateString) return ""
  const date = new Date(dateString + "T00:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
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

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

export function generateEmailContent(showDetails: ShowDetails, driveFolderUrl?: string): string {
  const formattedDate = formatDate(showDetails.showDate)
  const formattedShowTime = formatTime(showDetails.showTime)
  const formattedTechTime = showDetails.techRehearsalTime ? formatTime(showDetails.techRehearsalTime) : "N/A"

  const ticketLines = [
    `Presale: ${formatPrice(showDetails.presaleTicketPrice)}`,
    `Door: ${formatPrice(showDetails.doorTicketPrice)}`,
    showDetails.digitalTicket.enabled ? `Digital: ${formatPrice(showDetails.digitalTicket.price)}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  return `Hi there,

We're excited to confirm "${showDetails.showTitle}" at ${showDetails.venue}!

SHOW DETAILS
Date: ${formattedDate}
Show Time: ${formattedShowTime}
Tech Rehearsal: ${formattedTechTime}
Venue: ${showDetails.venue}

TICKET PRICING
${ticketLines}

SHOW FOLDER
${driveFolderUrl ? `Access your show folder here: ${driveFolderUrl}` : "A Google Drive folder will be created for this show."}

Please review these details and let us know if any changes are needed.

Best,
UCB Artistic Team`
}

export function EmailPreview({ showDetails, driveFolderUrl, emailContent, onEmailContentChange }: EmailPreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(emailContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    onEmailContentChange(generateEmailContent(showDetails, driveFolderUrl))
  }

  // Keep email in sync if driveFolderUrl arrives later (e.g. after confirmation)
  // but only if the user hasn't manually edited. We detect "hasn't edited"
  // by comparing to the generated default without the URL.
  useEffect(() => {
    if (!driveFolderUrl) return
    const withoutUrl = generateEmailContent(showDetails, undefined)
    if (emailContent === withoutUrl) {
      onEmailContentChange(generateEmailContent(showDetails, driveFolderUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveFolderUrl])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Confirmation Email
            </CardTitle>
            <CardDescription>Review and customize before sending</CardDescription>
          </div>
          <Badge variant="secondary" className="font-normal">
            To: {showDetails.producerEmail}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="edit">
              <Edit2 className="h-4 w-4 mr-1.5" />
              Edit
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{emailContent}</pre>
            </div>
          </TabsContent>
          <TabsContent value="edit" className="mt-4">
            <Textarea
              value={emailContent}
              onChange={(e) => onEmailContentChange(e.target.value)}
              className="min-h-[360px] font-sans text-sm leading-relaxed"
            />
            <Button variant="ghost" size="sm" onClick={handleReset} className="mt-2">
              Reset to default
            </Button>
          </TabsContent>
        </Tabs>

        <Button onClick={handleCopy} variant="outline" className="w-full">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
