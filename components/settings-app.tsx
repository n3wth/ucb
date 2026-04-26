"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToolPage } from "@/components/tool-page"
import { Check, RotateCcw } from "lucide-react"
import {
  DEFAULT_EMAIL_SETTINGS,
  loadEmailSettings,
  resetEmailSettings,
  saveEmailSettings,
  type EmailSettings,
} from "@/lib/asssscat-settings"

const inputClasses =
  "bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-10 placeholder:text-muted-foreground"

interface FieldConfig {
  key: keyof EmailSettings
  label: string
  description?: string
  placeholder?: string
}

const ASSSSCAT_FIELDS: FieldConfig[] = [
  {
    key: "asssscatCallTime",
    label: "Call time",
    description: "When the show begins.",
    placeholder: DEFAULT_EMAIL_SETTINGS.asssscatCallTime,
  },
  {
    key: "asssscatArrivalTime",
    label: "Arrival time",
    description: "Latest time cast should be at the venue.",
    placeholder: DEFAULT_EMAIL_SETTINGS.asssscatArrivalTime,
  },
  {
    key: "asssscatContactPhone",
    label: "Contact phone",
    description: "Number cast should call or text if running late.",
    placeholder: DEFAULT_EMAIL_SETTINGS.asssscatContactPhone,
  },
  {
    key: "asssscatCompsEmail",
    label: "Comps email",
    description: "Where the cast should send comp ticket requests.",
    placeholder: DEFAULT_EMAIL_SETTINGS.asssscatCompsEmail,
  },
  {
    key: "asssscatVenue",
    label: "Venue",
    description: "Full address shown in the email.",
    placeholder: DEFAULT_EMAIL_SETTINGS.asssscatVenue,
  },
  {
    key: "asssscatSignature",
    label: "Signature",
    description: "Optional closing line. Leave blank to omit.",
    placeholder: DEFAULT_EMAIL_SETTINGS.asssscatSignature,
  },
]

const SHOW_CONFIRMATION_FIELDS: FieldConfig[] = [
  {
    key: "showConfirmationSignature",
    label: "Signature",
    description: "Closing line on producer confirmation emails.",
    placeholder: DEFAULT_EMAIL_SETTINGS.showConfirmationSignature,
  },
]

export function SettingsApp() {
  const [hydrated, setHydrated] = useState(false)
  const [draft, setDraft] = useState<EmailSettings>(DEFAULT_EMAIL_SETTINGS)
  const [saved, setSaved] = useState<EmailSettings>(DEFAULT_EMAIL_SETTINGS)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    const loaded = loadEmailSettings()
    setSaved(loaded)
    setDraft(loaded)
    setHydrated(true)
  }, [])

  const dirty = useMemo(() => {
    return (Object.keys(DEFAULT_EMAIL_SETTINGS) as (keyof EmailSettings)[]).some(
      (k) => draft[k] !== saved[k],
    )
  }, [draft, saved])

  const handleChange = (key: keyof EmailSettings, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    const cleaned = saveEmailSettings(draft)
    setSaved(cleaned)
    setDraft(cleaned)
    setSavedAt(Date.now())
  }

  const handleResetAll = () => {
    const cleaned = resetEmailSettings()
    setSaved(cleaned)
    setDraft(cleaned)
    setSavedAt(Date.now())
  }

  const handleResetField = (key: keyof EmailSettings) => {
    setDraft((prev) => ({ ...prev, [key]: DEFAULT_EMAIL_SETTINGS[key] }))
  }

  if (!hydrated) return null

  return (
    <ToolPage
      title="Settings"
      description="Edit the defaults used when composing emails. Changes are saved to this browser."
      size="md"
      actions={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResetAll}
          className="text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Reset all
        </Button>
      }
    >
      <div className="space-y-6">
        <SettingsSection
          title="ASSSSCAT email"
          description="Defaults used by the ASSSSCAT cast booking email."
          fields={ASSSSCAT_FIELDS}
          draft={draft}
          onChange={handleChange}
          onResetField={handleResetField}
        />

        <SettingsSection
          title="Show confirmation email"
          description="Defaults used by the producer confirmation email."
          fields={SHOW_CONFIRMATION_FIELDS}
          draft={draft}
          onChange={handleChange}
          onResetField={handleResetField}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          {savedAt && !dirty && (
            <span
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Saved
            </span>
          )}
          <Button type="button" onClick={handleSave} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </div>
    </ToolPage>
  )
}

interface SettingsSectionProps {
  title: string
  description: string
  fields: FieldConfig[]
  draft: EmailSettings
  onChange: (key: keyof EmailSettings, value: string) => void
  onResetField: (key: keyof EmailSettings) => void
}

function SettingsSection({
  title,
  description,
  fields,
  draft,
  onChange,
  onResetField,
}: SettingsSectionProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {fields.map((field) => {
          const value = draft[field.key]
          const fallback = DEFAULT_EMAIL_SETTINGS[field.key]
          const isDefault = value === fallback
          const inputId = `setting-${field.key}`
          return (
            <div key={field.key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={inputId} className="text-xs font-medium text-foreground">
                  {field.label}
                </Label>
                {!isDefault && (
                  <button
                    type="button"
                    onClick={() => onResetField(field.key)}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              <Input
                id={inputId}
                type="text"
                value={value}
                placeholder={field.placeholder}
                onChange={(e) => onChange(field.key, e.target.value)}
                className={inputClasses}
              />
              {field.description && (
                <p className="text-[11px] text-muted-foreground">{field.description}</p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
