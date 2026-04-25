"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToolPage } from "@/components/tool-page"
import {
  ASSSSCAT_DEFAULTS,
  ASSSSCAT_FIELDS,
  type AsssscatTemplateSettings,
  loadEmailTemplateSettings,
  resetEmailTemplateSettings,
  saveEmailTemplateSettings,
} from "@/lib/email-template-settings"

const inputClasses =
  "bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-10 placeholder:text-muted-foreground"

export function EmailTemplateSettings() {
  const [asssscat, setAsssscat] = useState<AsssscatTemplateSettings>(ASSSSCAT_DEFAULTS)
  const [hydrated, setHydrated] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    setAsssscat(loadEmailTemplateSettings().asssscat)
    setHydrated(true)
  }, [])

  const updateAsssscat = (
    key: keyof AsssscatTemplateSettings,
    value: string,
  ) => {
    const next = { ...asssscat, [key]: value }
    setAsssscat(next)
    saveEmailTemplateSettings({ asssscat: next })
    setSavedAt(Date.now())
  }

  const handleReset = () => {
    const defaults = resetEmailTemplateSettings()
    setAsssscat(defaults.asssscat)
    setSavedAt(Date.now())
  }

  const isDirty = ASSSSCAT_FIELDS.some(
    (f) => asssscat[f.key] !== ASSSSCAT_DEFAULTS[f.key],
  )

  return (
    <ToolPage
      title="Settings"
      description="Edit default values used in outgoing email templates. Saved on this device."
    >
      {!hydrated ? (
        <div className="border border-dashed border-border rounded-lg py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium text-foreground">
                    ASSSSCAT
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Defaults used to render the cast booking email. Changes save automatically and
                    apply the next time you open the ASSSSCAT tool.
                  </CardDescription>
                </div>
                {isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                  >
                    Reset to defaults
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ASSSSCAT_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`asssscat-${field.key}`} className="text-xs">
                    {field.label}
                  </Label>
                  <Input
                    id={`asssscat-${field.key}`}
                    value={asssscat[field.key]}
                    onChange={(e) => updateAsssscat(field.key, e.target.value)}
                    placeholder={ASSSSCAT_DEFAULTS[field.key]}
                    className={inputClasses}
                  />
                  {field.hint && (
                    <p className="text-[11px] text-muted-foreground">{field.hint}</p>
                  )}
                </div>
              ))}
              <p
                className="text-[11px] text-muted-foreground pt-1"
                aria-live="polite"
              >
                {savedAt ? "Saved." : "Edits save automatically."}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </ToolPage>
  )
}
