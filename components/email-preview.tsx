"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Mail, Edit2, RotateCcw } from "lucide-react"
import { formatDate, formatTime, formatPrice } from "@/lib/format"
import type { ShowDetails } from "@/lib/types"

interface EmailPreviewProps {
  showDetails: ShowDetails
  driveFolderUrl?: string
  emailContent: string
  onEmailContentChange: (value: string) => void
}

export function generateEmailContent(showDetails: ShowDetails, driveFolderUrl?: string): string {
  const formattedDate = formatDate(showDetails.showDate)
  const formattedShowTime = formatTime(showDetails.showTime)
  const formattedTechTime = showDetails.techRehearsalTime ? formatTime(showDetails.techRehearsalTime) : "Not scheduled"

  const ticketLines = [
    `Presale: ${formatPrice(showDetails.presaleTicketPrice)}`,
    `Door: ${formatPrice(showDetails.doorTicketPrice)}`,
    showDetails.digitalTicket.enabled ? `Digital stream: ${formatPrice(showDetails.digitalTicket.price)}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  return `Hi there,

Your show "${showDetails.showTitle}" at ${showDetails.venue} is confirmed.

SHOW DETAILS
Date: ${formattedDate}
Show time: ${formattedShowTime}
Tech rehearsal: ${formattedTechTime}
Venue: ${showDetails.venue}

TICKET PRICING
${ticketLines}

SHOW FOLDER
${driveFolderUrl ? `Your show folder: ${driveFolderUrl}` : "A Google Drive folder will be created for your show materials."}

Please review these details and reply if anything needs to be changed.

Thanks,
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

  useEffect(() => {
    if (!driveFolderUrl) return
    const withoutUrl = generateEmailContent(showDetails, undefined)
    if (emailContent === withoutUrl) {
      onEmailContentChange(generateEmailContent(showDetails, driveFolderUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveFolderUrl])

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Mail className="h-4 w-4 text-primary" />
              Confirmation Email
            </CardTitle>
            <CardDescription className="text-xs">Will be sent to the producer after confirming</CardDescription>
          </div>
          <Badge variant="secondary" className="font-normal text-xs">
            To: {showDetails.producerEmail}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            <TabsTrigger value="edit" className="text-xs">
              <Edit2 className="h-3 w-3 mr-1.5" />
              Edit Email
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 max-h-80 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{emailContent}</pre>
            </div>
          </TabsContent>
          <TabsContent value="edit" className="mt-4 space-y-3">
            <Textarea
              value={emailContent}
              onChange={(e) => onEmailContentChange(e.target.value)}
              className="min-h-[280px] font-sans text-sm leading-relaxed bg-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
            />
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-3 w-3 mr-1.5" />
              Reset email
            </Button>
          </TabsContent>
        </Tabs>

        <Button onClick={handleCopy} variant="outline" size="sm" className="w-full">
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-2 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
