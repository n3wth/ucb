"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, ExternalLink, Settings } from "lucide-react"

interface GoogleSetupProps {
  isConnected: boolean
  onConnect: () => void
}

export function GoogleSetup({ isConnected, onConnect }: GoogleSetupProps) {
  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span>Google Workspace connected</span>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg">Google Workspace Setup Required</CardTitle>
        </div>
        <CardDescription className="text-amber-800">
          Connect your Google account to enable calendar events and Drive folder creation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p className="font-medium">This prototype requires the following environment variables:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">GOOGLE_CLIENT_ID</code> - OAuth client ID</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">GOOGLE_CLIENT_SECRET</code> - OAuth client secret</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">GOOGLE_REDIRECT_URI</code> - Callback URL</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">GOOGLE_REFRESH_TOKEN</code> - Refresh token</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">UCB_CALENDAR_ID</code> - Shared calendar ID</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">UCB_FRANKLIN_FOLDER_ID</code> - Franklin venue folder</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">UCB_ANNEX_FOLDER_ID</code> - Annex venue folder</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button onClick={onConnect} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Connect Google Account
          </Button>
          <Button variant="ghost" asChild>
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Google Cloud Console
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          For the prototype demo, the tool works in simulation mode without Google integration.
        </p>
      </CardContent>
    </Card>
  )
}
