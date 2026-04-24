"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Pencil, Plus, Trash2, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ASSSSCAT_PERFORMER_CATEGORIES,
  type AsssscatPerformer,
  type AsssscatPerformerCategory,
} from "@/lib/types"
import {
  addPerformer,
  groupByCategory,
  isValidEmail,
  newPerformerId,
  removePerformer,
  updatePerformer,
} from "@/lib/asssscat-performers"

type GroupFilter = "All" | AsssscatPerformerCategory

const GROUP_LABELS: Record<AsssscatPerformerCategory, string> = {
  "Core Cast": "Core",
  "Wild Cards": "Wild",
  "Subs": "Subs",
  "Drop-Ins": "Drop-Ins",
  "Test Group": "Test",
}

interface PerformerPanelProps {
  performers: AsssscatPerformer[]
  onChange: (next: AsssscatPerformer[]) => void
  onPickPerformer: (performer: AsssscatPerformer) => void
  selectedIds: string[]
  canAddMore: boolean
}

const inputClasses =
  "bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-9 placeholder:text-muted-foreground text-sm"

export function AsssscatPerformerPanel({
  performers,
  onChange,
  onPickPerformer,
  selectedIds,
  canAddMore,
}: PerformerPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")
  const [draftEmail, setDraftEmail] = useState("")
  const [draftCategory, setDraftCategory] =
    useState<AsssscatPerformerCategory>("Core Cast")
  const [error, setError] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState<GroupFilter>("All")

  const grouped = useMemo(() => groupByCategory(performers), [performers])
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const visibleCategories = useMemo(
    () =>
      activeGroup === "All"
        ? ASSSSCAT_PERFORMER_CATEGORIES
        : ([activeGroup] as AsssscatPerformerCategory[]),
    [activeGroup],
  )

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setDraftName("")
    setDraftEmail("")
    setDraftCategory("Core Cast")
    setError(null)
  }

  const startAdd = () => {
    resetForm()
    setShowForm(true)
  }

  const startEdit = (p: AsssscatPerformer) => {
    setEditingId(p.id)
    setShowForm(true)
    setDraftName(p.name)
    setDraftEmail(p.email)
    setDraftCategory(p.category)
    setError(null)
  }

  const handleSave = () => {
    const name = draftName.trim()
    const email = draftEmail.trim()
    if (!name) {
      setError("Name is required.")
      return
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.")
      return
    }
    if (editingId) {
      onChange(
        updatePerformer(performers, editingId, {
          name,
          email,
          category: draftCategory,
        }),
      )
    } else {
      onChange(
        addPerformer(performers, {
          id: newPerformerId(),
          name,
          email,
          category: draftCategory,
        }),
      )
    }
    resetForm()
  }

  const handleRemove = (id: string) => {
    onChange(removePerformer(performers, id))
    if (editingId === id) resetForm()
  }

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Performers</h2>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={startAdd}
          disabled={showForm}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      <div className="flex items-center gap-1 px-4 py-2 border-b border-border overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveGroup("All")}
          className={cn(
            "shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors",
            activeGroup === "All"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          All
        </button>
        {ASSSSCAT_PERFORMER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveGroup(cat)}
            className={cn(
              "shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors",
              activeGroup === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {GROUP_LABELS[cat]}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="px-4 py-3 border-b border-border space-y-2.5 bg-muted/40">
          <div className="space-y-1">
            <Label htmlFor="perfName" className="text-xs">Name</Label>
            <Input
              id="perfName"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className={inputClasses}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="perfEmail" className="text-xs">Email</Label>
            <Input
              id="perfEmail"
              type="email"
              value={draftEmail}
              onChange={(e) => setDraftEmail(e.target.value)}
              className={inputClasses}
              placeholder="jane@example.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="perfCategory" className="text-xs">Category</Label>
            <Select
              value={draftCategory}
              onValueChange={(v) => setDraftCategory(v as AsssscatPerformerCategory)}
            >
              <SelectTrigger id="perfCategory" className={inputClasses}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSSSCAT_PERFORMER_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs"
              onClick={handleSave}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              {editingId ? "Save" : "Add"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={resetForm}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="max-h-[520px] overflow-y-auto">
        {performers.length === 0 ? (
          <p className="px-4 py-6 text-xs text-muted-foreground text-center">
            No performers yet. Add recurring cast members to quickly slot them
            into shows.
          </p>
        ) : (
          visibleCategories.map((category) => {
            const group = grouped[category]
            if (group.length === 0) return null
            return (
              <div key={category} className="border-b border-border last:border-b-0">
                <div className="px-4 pt-3 pb-1">
                  <h3 className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
                    {category}
                  </h3>
                </div>
                <ul>
                  {group.map((p) => {
                    const selected = selectedSet.has(p.id)
                    return (
                      <li
                        key={p.id}
                        className="px-4 py-1.5 flex items-center gap-2 hover:bg-muted/60 group"
                      >
                        <button
                          type="button"
                          className="flex-1 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => onPickPerformer(p)}
                          disabled={selected || !canAddMore || !p.email}
                          title={
                            !p.email
                              ? "No email on file — edit to add"
                              : selected
                              ? "Already in cast"
                              : canAddMore
                              ? "Add to cast"
                              : "Cast is full"
                          }
                        >
                          <div className="text-sm text-foreground truncate flex items-center gap-1.5">
                            {p.name}
                            {selected && (
                              <span className="text-[10px] text-muted-foreground">
                                ✓ in cast
                              </span>
                            )}
                            {!p.email && !selected && (
                              <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" aria-label="No email on file" />
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {p.email || (
                              <span className="text-amber-500">no email on file</span>
                            )}
                          </div>
                        </button>
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                          onClick={() => startEdit(p)}
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          onClick={() => handleRemove(p.id)}
                          aria-label={`Remove ${p.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
