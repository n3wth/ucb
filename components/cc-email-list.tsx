"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MAX_DEFAULT_CC, isValidEmail, normalizeEmail } from "@/lib/cc-preferences"

interface CcEmailListProps {
  emails: string[]
  onChange: (next: string[]) => void
  inputId: string
  placeholder?: string
  disabled?: boolean
  max?: number
  emptyHint?: string
}

export function CcEmailList({
  emails,
  onChange,
  inputId,
  placeholder = "person@example.com",
  disabled,
  max = MAX_DEFAULT_CC,
  emptyHint,
}: CcEmailListProps) {
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)

  const inputClasses =
    "bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-10 placeholder:text-muted-foreground"

  const addFromDraft = () => {
    const candidate = normalizeEmail(draft)
    if (!candidate) {
      setDraft("")
      setError(null)
      return
    }
    if (!isValidEmail(candidate)) {
      setError("Enter a valid email address.")
      return
    }
    if (emails.some((e) => e.toLowerCase() === candidate.toLowerCase())) {
      setError("That email is already on the list.")
      return
    }
    if (emails.length >= max) {
      setError(`Limit of ${max} addresses reached.`)
      return
    }
    onChange([...emails, candidate])
    setDraft("")
    setError(null)
  }

  const remove = (target: string) => {
    onChange(emails.filter((e) => e !== target))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (draft.trim()) {
        e.preventDefault()
        addFromDraft()
      }
    }
  }

  const atLimit = emails.length >= max

  return (
    <div className="space-y-2">
      {emails.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {emails.map((email) => (
            <Badge
              key={email}
              variant="secondary"
              className="font-normal text-xs pl-2.5 pr-1 py-0.5 gap-1"
            >
              <span className="break-all">{email}</span>
              <button
                type="button"
                onClick={() => remove(email)}
                disabled={disabled}
                aria-label={`Remove ${email}`}
                className="rounded p-0.5 hover:bg-foreground/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : emptyHint ? (
        <p className="text-xs text-muted-foreground">{emptyHint}</p>
      ) : null}

      <div className="flex gap-2">
        <Input
          id={inputId}
          type="email"
          inputMode="email"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft.trim()) addFromDraft()
          }}
          disabled={disabled || atLimit}
          className={inputClasses}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addFromDraft}
          disabled={disabled || atLimit || !draft.trim()}
          className="h-10 shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {!error && atLimit && (
        <p className="text-xs text-muted-foreground">Limit of {max} addresses reached.</p>
      )}
    </div>
  )
}
