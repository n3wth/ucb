"use client"

import { useState, useEffect } from "react"
import { ShowConfirmationForm } from "@/components/show-confirmation-form"
import { EmailPreview } from "@/components/email-preview"
import { ConfirmationResults } from "@/components/confirmation-results"
import { GoogleSetup } from "@/components/google-setup"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, FileText } from "lucide-react"
import type { ShowDetails, ConfirmationResult } from "@/lib/types"

type AppState = "form" | "preview" | "results"

export default function Home() {
  const [appState, setAppState] = useState<AppState>("form")
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState<ShowDetails | null>(null)
  const [result, setResult] = useState<ConfirmationResult | null>(null)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [useSimulation, setUseSimulation] = useState(true)

  // Check if Google credentials are available
  useEffect(() => {
    // In a real app, this would check the server for OAuth status
    // For the prototype, we'll assume simulation mode
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/status")
        if (res.ok) {
          const data = await res.json()
          setIsGoogleConnected(data.connected)
          setUseSimulation(!data.connected)
        }
      } catch {
        // Default to simulation mode
        setUseSimulation(true)
      }
    }
    checkAuth()
  }, [])

  const handleFormSubmit = async (data: ShowDetails) => {
    setIsLoading(true)
    setShowDetails(data)

    let confirmationResult: ConfirmationResult

    if (useSimulation) {
      // Simulate API call delay for prototype demo
      await new Promise((resolve) => setTimeout(resolve, 1500))

      confirmationResult = {
        emailGenerated: true,
        calendarEventCreated: true,
        driveFolderCreated: true,
        driveFolderUrl: `https://drive.google.com/drive/folders/example-${data.showTitle.toLowerCase().replace(/\s+/g, "-")}`,
      }
    } else {
      // Call real API
      try {
        const response = await fetch("/api/confirm-show", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        confirmationResult = await response.json()
      } catch (error) {
        confirmationResult = {
          emailGenerated: false,
          calendarEventCreated: false,
          driveFolderCreated: false,
          errors: [error instanceof Error ? error.message : "Network error"],
        }
      }
    }

    setResult(confirmationResult)
    setIsLoading(false)
    setAppState("preview")
  }

  const handleReset = () => {
    setAppState("form")
    setShowDetails(null)
    setResult(null)
  }

  const handleConfirmEmail = () => {
    setAppState("results")
  }

  const handleGoogleConnect = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-balance">
              UCB Show Confirmation
            </h1>
            <Badge variant={useSimulation ? "secondary" : "default"}>
              {useSimulation ? "Prototype Mode" : "Live"}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
            Streamline show confirmations by automatically generating emails, calendar events, and Drive folders in one workflow.
          </p>
        </header>

        <div className="flex flex-col items-center gap-6">
          {!isGoogleConnected && appState === "form" && (
            <GoogleSetup 
              isConnected={isGoogleConnected} 
              onConnect={handleGoogleConnect} 
            />
          )}

          {appState === "form" && (
            <ShowConfirmationForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          )}

          {appState === "preview" && showDetails && result && (
            <div className="space-y-6 w-full max-w-2xl">
              <EmailPreview 
                showDetails={showDetails} 
                driveFolderUrl={result.driveFolderUrl} 
              />
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Back to Form
                </button>
                <button
                  onClick={handleConfirmEmail}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Complete Confirmation
                </button>
              </div>
            </div>
          )}

          {appState === "results" && showDetails && result && (
            <ConfirmationResults
              result={result}
              showDetails={showDetails}
              onReset={handleReset}
            />
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>UCB Show Confirmation Tool - Reduces confirmation time from 5 minutes to under 1 minute</p>
        </footer>
      </div>
    </main>
  )
}
