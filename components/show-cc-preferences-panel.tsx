"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight, Film, Plus, Trash2 } from "lucide-react"
import { CcEmailList } from "@/components/cc-email-list"
import {
  loadShowCcMap,
  saveShowCcEmails,
  deleteShowCcEmails,
  normalizeShowTitle,
  type ShowCcMap,
} from "@/lib/show-cc-preferences"

interface ShowCcPreferencesPanelProps {
  /** When provided, show an inline editor for this specific title. */
  activeShowTitle?: string
  /** Called after saves so the parent can refresh any derived state. */
  onChange?: () => void
}

export function ShowCcPreferencesPanel({ activeShowTitle, onChange }: ShowCcPreferencesPanelProps) {
  const [map, setMap] = useState<ShowCcMap>({})
  const [expanded, setExpanded] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [newTitleDraft, setNewTitleDraft] = useState("")
  const [newTitle, setNewTitle] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | null>(null)

  useEffect(() => {
    setMap(loadShowCcMap())
    setHydrated(true)
  }, [])

  const refresh = () => {
    setMap(loadShowCcMap())
    onChange?.()
  }

  const handleUpdate = (title: string, emails: string[]) => {
    saveShowCcEmails(title, emails)
    refresh()
  }

  const handleDelete = (title: string) => {
    deleteShowCcEmails(title)
    if (newTitle && normalizeShowTitle(newTitle) === normalizeShowTitle(title)) {
      setNewTitle(null)
    }
    refresh()
  }

  const handleAddTitle = () => {
    const candidate = newTitleDraft.trim()
    if (!candidate) {
      setTitleError("Enter a show title.")
      return
    }
    const key = normalizeShowTitle(candidate)
    if (map[key] && map[key].length > 0) {
      setTitleError("That show already has a CC list below.")
      return
    }
    if (activeShowTitle && normalizeShowTitle(activeShowTitle) === key) {
      setTitleError("That title is already being edited above.")
      return
    }
    setNewTitle(candidate)
    setNewTitleDraft("")
    setTitleError(null)
  }

  if (!hydrated) return null

  const savedTitles = Object.keys(map).sort()
  const totalCount = savedTitles.length

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
              <Film className="h-4 w-4 text-foreground" />
              CC by show title
              {totalCount > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({totalCount} {totalCount === 1 ? "show" : "shows"})
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              Save CC addresses per recurring show. They auto-populate when you type a matching title.
            </CardDescription>
          </div>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-foreground shrink-0" />
          )}
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-5">
          {/* Add a CC list for any show title without typing it in the booking form first. */}
          <div className="space-y-2">
            <Label htmlFor="show-cc-new-title" className="text-xs font-medium text-foreground">
              Add CC list for a show
            </Label>
            <div className="flex gap-2">
              <Input
                id="show-cc-new-title"
                type="text"
                placeholder="Show title (e.g. Harold Night)"
                value={newTitleDraft}
                onChange={(e) => {
                  setNewTitleDraft(e.target.value)
                  if (titleError) setTitleError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTitleDraft.trim()) {
                    e.preventDefault()
                    handleAddTitle()
                  }
                }}
                className="bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-10 placeholder:text-muted-foreground"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTitle}
                disabled={!newTitleDraft.trim()}
                className="h-10 shrink-0"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
            {titleError && <p className="text-xs text-destructive">{titleError}</p>}
          </div>

          {/* Inline editor for the currently typed show title */}
          {activeShowTitle && (
            <ShowTitleCcEditor
              title={activeShowTitle}
              emails={map[normalizeShowTitle(activeShowTitle)] ?? []}
              onUpdate={(emails) => handleUpdate(activeShowTitle, emails)}
              onDelete={() => handleDelete(activeShowTitle)}
              isActive
            />
          )}

          {/* Editor for a title just added via the input above (not yet saved). */}
          {newTitle &&
            normalizeShowTitle(newTitle) !== normalizeShowTitle(activeShowTitle ?? "") &&
            !map[normalizeShowTitle(newTitle)] && (
              <ShowTitleCcEditor
                title={newTitle}
                emails={[]}
                onUpdate={(emails) => handleUpdate(newTitle, emails)}
                onDelete={() => handleDelete(newTitle)}
              />
            )}

          {/* All other saved shows */}
          {savedTitles
            .filter((key) => key !== normalizeShowTitle(activeShowTitle ?? ""))
            .map((key) => (
              <ShowTitleCcEditor
                key={key}
                title={key}
                emails={map[key] ?? []}
                onUpdate={(emails) => handleUpdate(key, emails)}
                onDelete={() => handleDelete(key)}
              />
            ))}
        </CardContent>
      )}
    </Card>
  )
}

interface ShowTitleCcEditorProps {
  title: string
  emails: string[]
  onUpdate: (emails: string[]) => void
  onDelete: () => void
  isActive?: boolean
}

function ShowTitleCcEditor({ title, emails, onUpdate, onDelete, isActive }: ShowTitleCcEditorProps) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground truncate">
          {title}
          {isActive && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">(current)</span>
          )}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
          aria-label={`Delete CC list for ${title}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <CcEmailList
        inputId={`show-cc-${title.replace(/\s+/g, "-")}`}
        emails={emails}
        onChange={onUpdate}
        placeholder="add@example.com"
        emptyHint="No addresses saved for this show."
      />
    </div>
  )
}
