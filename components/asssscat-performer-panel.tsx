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
import { AlertCircle, Heart, Pencil, Plus, Trash2, X, Check, ThumbsDown, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ASSSSCAT_PERFORMER_CATEGORIES,
  PERFORMER_GENDERS,
  PERFORMER_RACES,
  type AsssscatPerformer,
  type AsssscatPerformerCategory,
  type CompatibilityMap,
  type PerformerGender,
  type PerformerRace,
} from "@/lib/types"
import {
  addPerformer,
  groupByCategory,
  isValidEmail,
  newPerformerId,
  removePerformer,
  updatePerformer,
} from "@/lib/asssscat-performers"
import {
  likedCollaboratorCount,
  setPerformerCompatibility,
} from "@/lib/asssscat-compatibility"

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
  onPerformerRemoved?: (performerId: string) => void
  selectedIds: string[]
  canAddMore: boolean
  compatibility: CompatibilityMap
  onCompatibilityChange: (performerId: string, patch: { likes?: string[]; dislikes?: string[] }) => void
  onCompatibilitySave: (map: CompatibilityMap) => void
}

const inputClasses =
  "bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-9 placeholder:text-muted-foreground text-sm"

export function AsssscatPerformerPanel({
  performers,
  onChange,
  onPickPerformer,
  onPerformerRemoved,
  selectedIds,
  canAddMore,
  compatibility,
  onCompatibilityChange,
}: PerformerPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")
  const [draftEmail, setDraftEmail] = useState("")
  const [draftCategory, setDraftCategory] =
    useState<AsssscatPerformerCategory>("Core Cast")
  const [error, setError] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState<GroupFilter>("All")
  // The performer whose affinity settings are currently open
  const [affinityForId, setAffinityForId] = useState<string | null>(null)
  const [affinitySearch, setAffinitySearch] = useState("")
  const [demoGenders, setDemoGenders] = useState<PerformerGender[]>([])
  const [demoRaces, setDemoRaces] = useState<PerformerRace[]>([])
  const [demoLgbtq, setDemoLgbtq] = useState<boolean | null>(null)
  const [showDemoFilter, setShowDemoFilter] = useState(false)

  const hasDemoFilter = demoGenders.length > 0 || demoRaces.length > 0 || demoLgbtq !== null

  const filteredPerformers = useMemo(() => {
    if (!hasDemoFilter) return performers
    return performers.filter((p) => {
      if (demoGenders.length > 0 && (!p.gender || !demoGenders.includes(p.gender))) return false
      if (demoRaces.length > 0 && (!p.race || !demoRaces.includes(p.race))) return false
      if (demoLgbtq !== null && Boolean(p.lgbtq) !== demoLgbtq) return false
      return true
    })
  }, [performers, demoGenders, demoRaces, demoLgbtq, hasDemoFilter])

  const grouped = useMemo(() => groupByCategory(filteredPerformers), [filteredPerformers])
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
    if (affinityForId === id) setAffinityForId(null)
    onPerformerRemoved?.(id)
  }

  const toggleLike = (subjectId: string, targetId: string) => {
    const entry = compatibility[subjectId] ?? { likes: [], dislikes: [] }
    const isLiked = entry.likes.includes(targetId)
    const newLikes = isLiked
      ? entry.likes.filter((x) => x !== targetId)
      : [...entry.likes, targetId]
    // Liking someone removes them from dislikes
    const newDislikes = entry.dislikes.filter((x) => x !== targetId)
    onCompatibilityChange(subjectId, { likes: newLikes, dislikes: newDislikes })
  }

  const toggleDislike = (subjectId: string, targetId: string) => {
    const entry = compatibility[subjectId] ?? { likes: [], dislikes: [] }
    const isDisliked = entry.dislikes.includes(targetId)
    const newDislikes = isDisliked
      ? entry.dislikes.filter((x) => x !== targetId)
      : [...entry.dislikes, targetId]
    // Disliking someone removes them from likes
    const newLikes = entry.likes.filter((x) => x !== targetId)
    onCompatibilityChange(subjectId, { likes: newLikes, dislikes: newDislikes })
  }

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Performers</h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={hasDemoFilter ? "default" : "ghost"}
            className="h-7 px-2 text-xs"
            onClick={() => setShowDemoFilter((v) => !v)}
            title="Filter by demographics"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {hasDemoFilter && (
              <span className="ml-1 text-[10px]">
                {demoGenders.length + demoRaces.length + (demoLgbtq !== null ? 1 : 0)}
              </span>
            )}
          </Button>
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
      </div>

      {showDemoFilter && (
        <div className="px-4 py-2 border-b border-border bg-muted/20 space-y-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Gender</p>
            <div className="flex flex-wrap gap-1">
              {PERFORMER_GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() =>
                    setDemoGenders((prev) =>
                      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
                    )
                  }
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded border transition-colors",
                    demoGenders.includes(g)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Race</p>
            <div className="flex flex-wrap gap-1">
              {PERFORMER_RACES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() =>
                    setDemoRaces((prev) =>
                      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
                    )
                  }
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded border transition-colors",
                    demoRaces.includes(r)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">LGBTQ+</p>
            {([true, false] as const).map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setDemoLgbtq((prev) => (prev === val ? null : val))}
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded border transition-colors",
                  demoLgbtq === val
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {val ? "Yes" : "No"}
              </button>
            ))}
            {hasDemoFilter && (
              <button
                type="button"
                className="text-[10px] text-muted-foreground hover:text-foreground ml-auto"
                onClick={() => { setDemoGenders([]); setDemoRaces([]); setDemoLgbtq(null) }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

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
                    const affinityOpen = affinityForId === p.id
                    const likedCount = likedCollaboratorCount(p.id, selectedIds, compatibility)
                    // Green intensity: 1 liked collab → low green, more → deeper
                    const affinityBg =
                      selected && likedCount > 0
                        ? likedCount >= 4
                          ? "bg-green-600/30 dark:bg-green-500/25"
                          : likedCount >= 2
                          ? "bg-green-600/20 dark:bg-green-500/15"
                          : "bg-green-600/10 dark:bg-green-500/10"
                        : ""
                    const entry = compatibility[p.id] ?? { likes: [], dislikes: [] }
                    return (
                      <li
                        key={p.id}
                        className={cn("px-4 flex flex-col group", affinityBg)}
                      >
                        <div className="py-1.5 flex items-center gap-2">
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
                              {selected && likedCount > 0 && (
                                <span className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-0.5">
                                  <Heart className="h-2.5 w-2.5 fill-current" />
                                  {likedCount}
                                </span>
                              )}
                              {selected && !(likedCount > 0) && (
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
                            className={cn(
                              "transition-opacity text-muted-foreground",
                              affinityOpen
                                ? "opacity-100 text-primary"
                                : "opacity-0 group-hover:opacity-100 hover:text-foreground",
                            )}
                            onClick={() => {
                              if (affinityOpen) {
                                setAffinityForId(null)
                              } else {
                                setAffinityForId(p.id)
                                setAffinitySearch("")
                              }
                            }}
                            aria-label={`${affinityOpen ? "Close" : "Edit"} affinity for ${p.name}`}
                            title="Edit compatibility preferences"
                          >
                            <Heart className="h-3.5 w-3.5" />
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
                        </div>
                        {affinityOpen && (
                          <div className="pb-2 pt-0.5 border-t border-border/60 mt-0.5">
                            <p className="text-[10px] text-muted-foreground mb-1.5 pt-1">
                              Compatibility for {p.name}
                            </p>
                            {performers.filter((other) => other.id !== p.id).length > 0 && (
                              <div className="mb-1.5">
                                <Input
                                  placeholder="Search performers..."
                                  value={affinitySearch}
                                  onChange={(e) => setAffinitySearch(e.target.value)}
                                  className="h-7 text-xs bg-input border-border"
                                />
                              </div>
                            )}
                            {(() => {
                              const q = affinitySearch.trim().toLowerCase()
                              const others = performers
                                .filter((other) => other.id !== p.id)
                                .filter((other) => !q || other.name.toLowerCase().includes(q))
                                .sort((a, b) => a.name.localeCompare(b.name))
                              return others.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-1">
                                  {performers.filter((other) => other.id !== p.id).length === 0
                                    ? "No other performers."
                                    : "No matches."}
                                </p>
                              ) : (
                                <div className="space-y-0.5 max-h-40 overflow-y-auto">
                                  {others.map((other) => {
                                    const liked = entry.likes.includes(other.id)
                                    const disliked = entry.dislikes.includes(other.id)
                                    return (
                                      <div
                                        key={other.id}
                                        className="flex items-center justify-between py-0.5 gap-2"
                                      >
                                        <span className="text-xs text-foreground truncate flex-1">
                                          {other.name}
                                        </span>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => toggleLike(p.id, other.id)}
                                            title={liked ? "Remove like" : "Mark as liked collaborator"}
                                            className={cn(
                                              "rounded p-0.5 transition-colors",
                                              liked
                                                ? "text-green-600 dark:text-green-400 bg-green-600/10"
                                                : "text-muted-foreground hover:text-green-600 dark:hover:text-green-400",
                                            )}
                                          >
                                            <Heart className="h-3 w-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => toggleDislike(p.id, other.id)}
                                            title={disliked ? "Remove conflict" : "Mark as incompatible"}
                                            className={cn(
                                              "rounded p-0.5 transition-colors",
                                              disliked
                                                ? "text-destructive bg-destructive/10"
                                                : "text-muted-foreground hover:text-destructive",
                                            )}
                                          >
                                            <ThumbsDown className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })()}
                          </div>
                        )}
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
