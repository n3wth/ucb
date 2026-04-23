"use client"

import { useState } from "react"
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
}

function formatDate(dateString: string): string {
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

function generateEmailContent(showDetails: ShowDetails, driveFolderUrl?: string): string {
  const formattedDate = formatDate(showDetails.showDate)
  const formattedShowTime = formatTime(showDetails.showTime)
  const formattedTechTime = showDetails.techRehearsalTime 
    ? formatTime(showDetails.techRehearsalTime) 
    : "N/A"

  return `Hi there,

We're excited to confirm "${showDetails.showTitle}" at ${showDetails.venue}!

SHOW DETAILS
Date: ${formattedDate}
Show Time: ${formattedShowTime}
Tech Rehearsal: ${formattedTechTime}
Venue: ${showDetails.venue}

TICKET PRICING
Presale: ${formatPrice(showDetails.presaleTicketPrice)}
At Door: ${formatPrice(showDetails.doorTicketPrice)}

LIVE STREAM
${showDetails.liveStream ? "Yes - this show will be live streamed" : "No live stream for this show"}

SHOW FOLDER
${driveFolderUrl ? `Access your show folder here: ${driveFolderUrl}` : "Your Google Drive folder will be created shortly."}

Please review these details and let us know if any changes are needed.

Best,
UCB Artistic Team`
}

export function EmailPreview({ showDetails, driveFolderUrl }: EmailPreviewProps) {
  const [emailContent, setEmailContent] = useState(() => 
    generateEmailContent(showDetails, driveFolderUrl)
  )
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(emailContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setEmailContent(generateEmailContent(showDetails, driveFolderUrl))
    setIsEditing(false)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Confirmation Email
            </CardTitle>
            <CardDescription>
              Review and customize the email before sending
            </CardDescription>
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
            <TabsTrigger value="edit" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-1.5" />
              Edit
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {emailContent}
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="edit" className="mt-4">
            <Textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className="min-h-[400px] font-sans text-sm leading-relaxed"
            />
            <Button variant="ghost" size="sm" onClick={handleReset} className="mt-2">
              Reset to default
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" className="flex-1">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
          <Button className="flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Open in Gmail
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
