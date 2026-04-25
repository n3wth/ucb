"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  matchPerformersByName,
  parseCastInput,
} from "@/lib/asssscat-performers"
import type { AsssscatPerformer } from "@/lib/types"

interface AsssscatAvailablePanelProps {
  performers: AsssscatPerformer[]
  names: string[]
  onChange: (next: string[]) => void
  filterActive: boolean
  onFilterToggle: (active: boolean) => void
}

export function AsssscatAvailablePanel({
  performers,
  names,
  onChange,
  filterActive,
  onFilterToggle,
}: AsssscatAvailablePanelProps) {
  const [draft, setDraft] = useState("")

  const matches = useMemo(
    () => matchPerformersByName(names, performers),
    [names, performers],
  )
  const matchedCount = matches.filter((r) => r.matched !== null).length
  const unmatched = matches.filter((r) => r.matched === null).map((r) => r.input)

  const addNames = (incoming: string[]) => {
    if (incoming.length === 0) return
    const seen = new Set(names.map((n) => n.toLowerCase()))
    const next = [...names]
    for (const raw of incoming) {
      const key = raw.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      next.push(raw)
    }
    if (next.length !== names.length) onChange(next)
  }

  const commitDraft = () => {
    const parsed = parseCastInput(draft)
    if (parsed.length === 0) {
      setDraft("")
      return
    }
    addNames(parsed)
    setDraft("")
  }

  const removeName = (target: string) => {
    onChange(names.filter((n) => n !== target))
  }

  const clearAll = () => {
    onChange([])
    if (filterActive) onFilterToggle(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commitDraft()
    } else if (e.key === "Backspace" && draft === "" && names.length > 0) {
      removeName(names[names.length - 1])
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text")
    if (!text) return
    const parsed = parseCastInput(text)
    if (parsed.length === 0) return
    if (parsed.length === 1 && !/[\n,]/.test(text)) return
    e.preventDefault()
    addNames(parsed)
    setDraft("")
  }

  return (
    <section className="border border-border rounded-lg bg-card p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-medium text-foreground">Available tonight</h3>
        {names.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={commitDraft}
        placeholder={names.length === 0 ? "Paste names or type, Enter to add" : "Add another"}
        className="h-8 text-xs bg-input border-border"
      />

      {names.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {matches.map((r, i) => {
            const isMatched = r.matched !== null
            return (
              <span
                key={`${r.input}-${i}`}
                title={isMatched ? r.matched!.email : "No matching performer"}
                className={cn(
                  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] border",
                  isMatched
                    ? "bg-muted/40 border-border text-foreground"
                    : "bg-destructive/10 border-destructive/40 text-destructive",
                )}
              >
                {isMatched ? (
                  <Check className="h-2.5 w-2.5 opacity-60" />
                ) : (
                  <AlertTriangle className="h-2.5 w-2.5" />
                )}
                <span className={cn("truncate max-w-[140px]", !isMatched && "line-through")}>
                  {isMatched ? r.matched!.name : r.input}
                </span>
                <button
                  type="button"
                  onClick={() => removeName(r.input)}
                  aria-label={`Remove ${r.input}`}
                  className="rounded hover:bg-foreground/10 p-0.5 -mr-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {names.length > 0 && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[10px] text-muted-foreground">
            {matchedCount}/{names.length} matched
            {unmatched.length > 0 && (
              <span className="text-destructive"> · {unmatched.length} unmatched</span>
            )}
          </span>
          <button
            type="button"
            onClick={() => onFilterToggle(!filterActive)}
            disabled={matchedCount === 0}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded border transition-colors",
              filterActive
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
              matchedCount === 0 && "opacity-40 cursor-not-allowed",
            )}
          >
            {filterActive ? "Filtering" : "Filter panel"}
          </button>
        </div>
      )}
    </section>
  )
}
