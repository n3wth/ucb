"use client"

import { useEffect, useRef, useState } from "react"
import { Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { AsssscatPerformer } from "@/lib/types"
import type { LineupPerformer } from "@/lib/asssscat-lineup-log"

interface PerformerChipInputProps {
  directory: AsssscatPerformer[]
  value: LineupPerformer[]
  onChange: (next: LineupPerformer[]) => void
  placeholder?: string
  className?: string
}

const MAX_SUGGESTIONS = 8

function filterSuggestions(
  query: string,
  directory: AsssscatPerformer[],
  selected: LineupPerformer[],
): AsssscatPerformer[] {
  const q = query.trim().toLowerCase()
  if (q.length === 0) return []
  const selectedIds = new Set(selected.map((p) => p.performerId).filter(Boolean))
  return directory
    .filter(
      (p) =>
        !selectedIds.has(p.id) &&
        p.name.toLowerCase().includes(q),
    )
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q)
      const bStarts = b.name.toLowerCase().startsWith(q)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      return a.name.localeCompare(b.name)
    })
    .slice(0, MAX_SUGGESTIONS)
}

export function PerformerChipInput({
  directory,
  value,
  onChange,
  placeholder = "Type a name to search...",
  className,
}: PerformerChipInputProps) {
  const [draft, setDraft] = useState("")
  const [suggestions, setSuggestions] = useState<AsssscatPerformer[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const next = filterSuggestions(draft, directory, value)
    setSuggestions(next)
    setActiveIndex(next.length > 0 ? 0 : -1)
  }, [draft, directory, value])

  const addPerformer = (performer: AsssscatPerformer) => {
    if (value.some((p) => p.performerId === performer.id)) return
    onChange([...value, { name: performer.name, performerId: performer.id }])
    setDraft("")
  }

  const addUnknown = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (value.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) return
    onChange([...value, { name: trimmed, performerId: null }])
    setDraft("")
  }

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const commitDraft = () => {
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      addPerformer(suggestions[activeIndex])
      return
    }
    if (draft.trim()) {
      // If there's exactly one suggestion, take it; otherwise add as unknown
      if (suggestions.length === 1) {
        addPerformer(suggestions[0])
      } else {
        addUnknown(draft)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      commitDraft()
    } else if (e.key === "Escape") {
      setSuggestions([])
      setActiveIndex(-1)
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      removeAt(value.length - 1)
    } else if (e.key === ",") {
      e.preventDefault()
      commitDraft()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text")
    if (!text || !/[\n,]/.test(text)) return
    e.preventDefault()
    const names = text
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    const added: LineupPerformer[] = []
    const seenIds = new Set(value.map((p) => p.performerId).filter(Boolean))
    const seenNames = new Set(value.map((p) => p.name.toLowerCase()))
    for (const name of names) {
      const match = directory.find((p) => p.name.toLowerCase() === name.toLowerCase())
      if (match && !seenIds.has(match.id)) {
        seenIds.add(match.id)
        added.push({ name: match.name, performerId: match.id })
      } else if (!match && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase())
        added.push({ name, performerId: null })
      }
    }
    if (added.length > 0) onChange([...value, ...added])
    setDraft("")
  }

  const open = suggestions.length > 0

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex flex-wrap gap-1 p-2 rounded-md border border-input bg-input min-h-[40px] cursor-text",
          open && "rounded-b-none border-b-0",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((p, i) => (
          <span
            key={`${p.performerId ?? p.name}-${i}`}
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs border",
              p.performerId
                ? "bg-secondary border-border text-foreground"
                : "bg-amber-50 border-amber-400/60 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
            )}
            title={p.performerId ? "Linked to Cast Directory" : "Not in Cast Directory"}
          >
            {p.performerId ? (
              <Check className="h-2.5 w-2.5 opacity-60 shrink-0" />
            ) : null}
            {p.name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeAt(i) }}
              aria-label={`Remove ${p.name}`}
              className="rounded hover:bg-foreground/10 p-0.5 -mr-0.5"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            // Delay so clicks on suggestions register first
            setTimeout(() => {
              setSuggestions([])
              setActiveIndex(-1)
            }, 150)
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[140px] h-6 border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          autoComplete="off"
        />
      </div>
      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full border border-input border-t-0 rounded-b-md bg-popover shadow-md max-h-48 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((p, i) => (
            <li
              key={p.id}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault()
                addPerformer(p)
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer",
                i === activeIndex
                  ? "bg-accent text-accent-foreground"
                  : "text-popover-foreground hover:bg-accent/50",
              )}
            >
              <span className="flex-1">{p.name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                {p.category}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
