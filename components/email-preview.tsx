"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Mail, Edit2, RotateCcw } from "lucide-react"
import { renderShowConfirmationBody } from "@/lib/emails"
import type { ShowDetails } from "@/lib/types"

interface EmailPreviewProps {
  showDetails: ShowDetails
  driveFolderUrl?: string
  emailContent: string
  onEmailContentChange: (value: string) => void
}

export function generateEmailContent(showDetails: ShowDetails, driveFolderUrl?: string): string {
  return renderShowConfirmationBody({ showDetails, driveFolderUrl })
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
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Mail className="h-4 w-4 text-foreground" />
              Confirmation email
            </CardTitle>
            <CardDescription className="text-xs">Will be sent to the producer after confirming.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="font-normal text-xs">
              To: {showDetails.producerEmail}
            </Badge>
            {showDetails.ccEmails.length > 0 && (
              <Badge variant="outline" className="font-normal text-xs">
                CC: {showDetails.ccEmails.join(", ")}
              </Badge>
            )}
            {showDetails.bccEmails.length > 0 && (
              <Badge variant="outline" className="font-normal text-xs">
                BCC: {showDetails.bccEmails.join(", ")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            <TabsTrigger value="edit" className="text-xs">
              <Edit2 className="h-3 w-3 mr-1.5" />
              Edit email
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
              <Check className="h-3.5 w-3.5 mr-2 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-2" />
              Copy to clipboard
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
