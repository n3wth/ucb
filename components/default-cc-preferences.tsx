"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Users } from "lucide-react"
import { CcEmailList } from "@/components/cc-email-list"
import { loadDefaultCcEmails, saveDefaultCcEmails } from "@/lib/cc-preferences"

interface DefaultCcPreferencesProps {
  onDefaultsChange?: (next: string[]) => void
}

export function DefaultCcPreferences({ onDefaultsChange }: DefaultCcPreferencesProps) {
  const [emails, setEmails] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = loadDefaultCcEmails()
    setEmails(stored)
    setHydrated(true)
    onDefaultsChange?.(stored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (next: string[]) => {
    const saved = saveDefaultCcEmails(next)
    setEmails(saved)
    onDefaultsChange?.(saved)
  }

  if (!hydrated) return null

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between gap-3 text-left"
          aria-expanded={expanded}
        >
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Users className="h-4 w-4 text-muted-foreground" />
              Default CC list
              {emails.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({emails.length})
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              These addresses are CC&apos;d on every confirmation email. Saved on this device.
            </CardDescription>
          </div>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          <CcEmailList
            inputId="defaultCcInput"
            emails={emails}
            onChange={update}
            placeholder="add@example.com"
            emptyHint="No defaults yet. Add addresses below to CC them on every show."
          />
          {emails.length > 0 && (
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => update([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
