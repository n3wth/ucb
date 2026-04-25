"use client"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Check, ChevronDown, ChevronUp, Heart, Pencil, Plus, ThumbsDown, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"

type GroupFilter = "All" | AsssscatPerformerCategory

const GROUP_LABELS: Record<AsssscatPerformerCategory, string> = {
  "Core Cast": "Core",
  "Wild Cards": "Wild",
  "Subs": "Subs",
  "Drop-Ins": "Drop-Ins",
  "Test Group": "Test",
}

interface DemographicFilter {
  genders: PerformerGender[]
  races: PerformerRace[]
  lgbtq: boolean | null
}

interface CastDirectoryProps {
  performers: AsssscatPerformer[]
  onChange: (next: AsssscatPerformer[]) => void
  onPerformerRemoved?: (performerId: string) => void
  compatibility?: CompatibilityMap
  onCompatibilityChange?: (performerId: string, patch: { likes?: string[]; dislikes?: string[] }) => void
  // Map of performer id → number of times they appear in the lineup log.
  // Computed from lineup-log records (not booking records) per ucb-qk8.
  lineupAppearancesById?: Map<string, number>
  // Click handler for the lineup-appearance count — typically navigates to
  // the Statistics tab scoped to that performer.
  onViewLineupStats?: (performerId: string) => void
}

const inputClasses =
  "bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-9 placeholder:text-muted-foreground text-sm"

const NONE_VALUE = "__none__"

function emptyDraft(): Omit<AsssscatPerformer, "id"> {
  return {
    name: "",
    email: "",
    category: "Core Cast",
    additionalEmail: "",
    phone: "",
    gender: undefined,
    races: undefined,
    lgbtq: false,
  }
}

export function CastDirectory({
  performers,
  onChange,
  onPerformerRemoved,
  compatibility = {},
  onCompatibilityChange,
  lineupAppearancesById,
  onViewLineupStats,
}: CastDirectoryProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Omit<AsssscatPerformer, "id">>(emptyDraft())
  const [error, setError] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState<GroupFilter>("All")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [demoFilter, setDemoFilter] = useState<DemographicFilter>({
    genders: [],
    races: [],
    lgbtq: null,
  })
  const [showDemoFilter, setShowDemoFilter] = useState(false)
  const [affinitySearch, setAffinitySearch] = useState("")

  // Ref to scroll the edit form into view (feature 1)
  const formRef = useRef<HTMLDivElement>(null)

  const toggleLike = (subjectId: string, targetId: string) => {
    const entry = compatibility[subjectId] ?? { likes: [], dislikes: [] }
    const isLiked = entry.likes.includes(targetId)
    const newLikes = isLiked ? entry.likes.filter((x) => x !== targetId) : [...entry.likes, targetId]
    const newDislikes = entry.dislikes.filter((x) => x !== targetId)
    onCompatibilityChange?.(subjectId, { likes: newLikes, dislikes: newDislikes })
  }

  const toggleDislike = (subjectId: string, targetId: string) => {
    const entry = compatibility[subjectId] ?? { likes: [], dislikes: [] }
    const isDisliked = entry.dislikes.includes(targetId)
    const newDislikes = isDisliked ? entry.dislikes.filter((x) => x !== targetId) : [...entry.dislikes, targetId]
    const newLikes = entry.likes.filter((x) => x !== targetId)
    onCompatibilityChange?.(subjectId, { likes: newLikes, dislikes: newDislikes })
  }

  const grouped = useMemo(() => groupByCategory(performers), [performers])

  const visibleCategories = useMemo(
    () =>
      activeGroup === "All"
        ? ASSSSCAT_PERFORMER_CATEGORIES
        : ([activeGroup] as AsssscatPerformerCategory[]),
    [activeGroup],
  )

  const hasDemoFilter =
    demoFilter.genders.length > 0 ||
    demoFilter.races.length > 0 ||
    demoFilter.lgbtq !== null

  const filteredPerformers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return performers.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) {
        return false
      }
      if (demoFilter.genders.length > 0 && (!p.gender || !demoFilter.genders.includes(p.gender))) {
        return false
      }
      if (
        demoFilter.races.length > 0 &&
        (!p.races || !p.races.some((r) => demoFilter.races.includes(r)))
      ) {
        return false
      }
      if (demoFilter.lgbtq !== null && Boolean(p.lgbtq) !== demoFilter.lgbtq) {
        return false
      }
      return true
    })
  }, [performers, search, demoFilter])

  const filteredGrouped = useMemo(() => groupByCategory(filteredPerformers), [filteredPerformers])

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setDraft(emptyDraft())
    setError(null)
  }

  const startAdd = () => {
    resetForm()
    setShowForm(true)
    // Scroll form into view after render
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    })
  }

  const startEdit = (p: AsssscatPerformer) => {
    setEditingId(p.id)
    setShowForm(true)
    setDraft({
      name: p.name,
      email: p.email,
      category: p.category,
      additionalEmail: p.additionalEmail ?? "",
      phone: p.phone ?? "",
      gender: p.gender,
      races: p.races,
      lgbtq: p.lgbtq ?? false,
      bookingCount: p.bookingCount,
    })
    setError(null)
    setExpandedId(null)
    setAffinitySearch("")
    // Scroll form into view at current scroll position (feature 1)
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    })
  }

  const handleSave = () => {
    const name = draft.name.trim()
    const email = draft.email.trim()
    const additionalEmail = draft.additionalEmail?.trim() ?? ""
    const phone = draft.phone?.trim() ?? ""

    if (!name) {
      setError("Name is required.")
      return
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.")
      return
    }
    if (additionalEmail && !isValidEmail(additionalEmail)) {
      setError("Additional email must be valid if provided.")
      return
    }

    const record: Omit<AsssscatPerformer, "id"> = {
      name,
      email,
      category: draft.category,
      additionalEmail: additionalEmail || undefined,
      phone: phone || undefined,
      gender: draft.gender,
      races: draft.races && draft.races.length > 0 ? draft.races : undefined,
      lgbtq: draft.lgbtq ?? false,
      bookingCount: draft.bookingCount,
    }

    if (editingId) {
      onChange(updatePerformer(performers, editingId, record))
    } else {
      onChange(addPerformer(performers, { ...record, id: newPerformerId() }))
    }
    resetForm()
  }

  const handleRemove = (id: string) => {
    onChange(removePerformer(performers, id))
    if (editingId === id) resetForm()
    if (expandedId === id) setExpandedId(null)
    onPerformerRemoved?.(id)
  }

  const toggleGenderFilter = (g: PerformerGender) => {
    setDemoFilter((f) => ({
      ...f,
      genders: f.genders.includes(g) ? f.genders.filter((x) => x !== g) : [...f.genders, g],
    }))
  }

  const toggleRaceFilter = (r: PerformerRace) => {
    setDemoFilter((f) => ({
      ...f,
      races: f.races.includes(r) ? f.races.filter((x) => x !== r) : [...f.races, r],
    }))
  }

  // The performer being edited (needed to show Likes/Dislikes inside the edit form)
  const editingPerformer = editingId ? performers.find((p) => p.id === editingId) ?? null : null

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search performers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs bg-input border-border flex-1"
        />
        <Button
          type="button"
          size="sm"
          variant={hasDemoFilter ? "default" : "outline"}
          className="h-8 px-2.5 text-xs shrink-0"
          onClick={() => setShowDemoFilter((v) => !v)}
        >
          Filter
          {hasDemoFilter && (
            <span className="ml-1 text-[10px] bg-primary-foreground text-primary rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {demoFilter.genders.length + demoFilter.races.length + (demoFilter.lgbtq !== null ? 1 : 0)}
            </span>
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2.5 text-xs shrink-0"
          onClick={startAdd}
          disabled={showForm}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      {/* Demographic filter panel */}
      {showDemoFilter && (
        <div className="border border-border rounded-lg bg-muted/30 p-3 space-y-3">
          <div>
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground mb-1.5">
              Gender
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PERFORMER_GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenderFilter(g)}
                  className={cn(
                    "text-[11px] px-2 py-0.5 rounded-md border transition-colors",
                    demoFilter.genders.includes(g)
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
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground mb-1.5">
              Race / Ethnicity
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PERFORMER_RACES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRaceFilter(r)}
                  className={cn(
                    "text-[11px] px-2 py-0.5 rounded-md border transition-colors",
                    demoFilter.races.includes(r)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
              LGBTQ+
            </p>
            <div className="flex gap-1.5">
              {([true, false] as const).map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() =>
                    setDemoFilter((f) => ({ ...f, lgbtq: f.lgbtq === val ? null : val }))
                  }
                  className={cn(
                    "text-[11px] px-2 py-0.5 rounded-md border transition-colors",
                    demoFilter.lgbtq === val
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
            {hasDemoFilter && (
              <button
                type="button"
                className="text-[11px] text-muted-foreground hover:text-foreground ml-auto"
                onClick={() => setDemoFilter({ genders: [], races: [], lgbtq: null })}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Group tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
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

      {/* Add / Edit form (feature 1: ref for scroll-into-view) */}
      {showForm && (
        <div ref={formRef} className="border border-border rounded-lg bg-muted/40 p-4 space-y-4">
          <h3 className="text-xs font-medium text-foreground">
            {editingId ? "Edit performer" : "Add performer"}
          </h3>

          {/* Contact section */}
          <div className="space-y-2">
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
              Contact
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="dirName" className="text-xs">Name *</Label>
                <Input
                  id="dirName"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  className={inputClasses}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dirCategory" className="text-xs">Category *</Label>
                <Select
                  value={draft.category}
                  onValueChange={(v) => setDraft((d) => ({ ...d, category: v as AsssscatPerformerCategory }))}
                >
                  <SelectTrigger id="dirCategory" className={inputClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSSSCAT_PERFORMER_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="dirEmail" className="text-xs">Email *</Label>
                <Input
                  id="dirEmail"
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                  className={inputClasses}
                  placeholder="jane@example.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dirAltEmail" className="text-xs">Additional email</Label>
                <Input
                  id="dirAltEmail"
                  type="email"
                  value={draft.additionalEmail ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, additionalEmail: e.target.value }))}
                  className={inputClasses}
                  placeholder="alt@example.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dirPhone" className="text-xs">Phone number</Label>
                <Input
                  id="dirPhone"
                  type="tel"
                  value={draft.phone ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                  className={inputClasses}
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Demographics section */}
          <div className="space-y-2 border-t border-border/40 pt-3">
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
              Demographics
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="dirGender" className="text-xs">Gender</Label>
                <Select
                  value={draft.gender ?? NONE_VALUE}
                  onValueChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      gender: v === NONE_VALUE ? undefined : (v as PerformerGender),
                    }))
                  }
                >
                  <SelectTrigger id="dirGender" className={inputClasses}>
                    <SelectValue placeholder="Not specified" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>Not specified</SelectItem>
                    {PERFORMER_GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Race / Ethnicity</Label>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Race / Ethnicity">
                  {PERFORMER_RACES.map((r) => {
                    const selected = draft.races?.includes(r) ?? false
                    return (
                      <button
                        key={r}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setDraft((d) => {
                            const current = d.races ?? []
                            const next = current.includes(r)
                              ? current.filter((x) => x !== r)
                              : [...current, r]
                            return { ...d, races: next.length > 0 ? next : undefined }
                          })
                        }
                        className={cn(
                          "text-[11px] px-2 py-0.5 rounded-md border transition-colors",
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                      >
                        {r}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground">Select all that apply.</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="dirLgbtq"
                  checked={draft.lgbtq ?? false}
                  onCheckedChange={(checked) =>
                    setDraft((d) => ({ ...d, lgbtq: checked === true }))
                  }
                />
                <Label htmlFor="dirLgbtq" className="text-xs cursor-pointer">
                  LGBTQ+ community member
                </Label>
              </div>
            </div>
          </div>

          {/* Likes / Dislikes section — only visible inside the edit form (feature 2) */}
          {editingPerformer && onCompatibilityChange && (
            <div className="space-y-2 border-t border-border/40 pt-3">
              <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground flex items-center gap-1.5">
                <Heart className="h-3 w-3" />
                Likes / Dislikes
                {(() => {
                  const entry = compatibility[editingPerformer.id]
                  const count = (entry?.likes?.length ?? 0) + (entry?.dislikes?.length ?? 0)
                  return count > 0 ? (
                    <span className="inline-flex items-center justify-center rounded-full text-[9px] font-semibold min-w-[14px] h-[14px] px-1 bg-muted-foreground/20 text-muted-foreground">
                      {count}
                    </span>
                  ) : null
                })()}
              </p>
              <Input
                placeholder="Search performers..."
                value={affinitySearch}
                onChange={(e) => setAffinitySearch(e.target.value)}
                className="h-7 text-xs bg-input border-border"
              />
              {(() => {
                const q = affinitySearch.trim().toLowerCase()
                const others = performers
                  .filter((other) => other.id !== editingPerformer.id)
                  .filter((other) => !q || other.name.toLowerCase().includes(q))
                  .sort((a, b) => a.name.localeCompare(b.name))
                const entry = compatibility[editingPerformer.id] ?? { likes: [], dislikes: [] }
                return others.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-1">No other performers.</p>
                ) : (
                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
                    {others.map((other) => {
                      const liked = entry.likes.includes(other.id)
                      const disliked = entry.dislikes.includes(other.id)
                      return (
                        <div key={other.id} className="flex items-center gap-2 py-0.5">
                          <span className="text-xs text-foreground flex-1 truncate">{other.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleLike(editingPerformer.id, other.id)}
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
                              onClick={() => toggleDislike(editingPerformer.id, other.id)}
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

          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" size="sm" className="h-8 text-xs" onClick={handleSave}>
              <Check className="h-3.5 w-3.5 mr-1" />
              {editingId ? "Save" : "Add"}
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" onClick={resetForm}>
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Performer list */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        {filteredPerformers.length === 0 ? (
          <p className="px-4 py-6 text-xs text-muted-foreground text-center">
            {hasDemoFilter || search ? "No performers match the current filters." : "No performers yet."}
          </p>
        ) : (
          visibleCategories.map((category) => {
            const group = filteredGrouped[category]
            if (group.length === 0) return null
            return (
              <div key={category} className="border-b border-border last:border-b-0">
                <div className="px-4 pt-3 pb-1">
                  <h3 className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
                    {category}
                    <span className="ml-2 normal-case tracking-normal font-normal text-muted-foreground/60">
                      ({group.length})
                    </span>
                  </h3>
                </div>
                <ul>
                  {group.map((p) => {
                    const isExpanded = expandedId === p.id
                    return (
                      <li key={p.id} className="border-t border-border/40 first:border-t-0">
                        <div className="px-4 py-2 flex items-center gap-2 group">
                          <button
                            type="button"
                            className="flex-1 text-left min-w-0"
                            onClick={() => {
                              setExpandedId(isExpanded ? null : p.id)
                            }}
                          >
                            <div className="text-sm text-foreground truncate">{p.name}</div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {p.email || <span className="text-amber-500">no email</span>}
                            </div>
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            {(() => {
                              const lineupCount = lineupAppearancesById?.get(p.id) ?? 0
                              if (lineupCount === 0) return null
                              const label = `${lineupCount} lineup ${lineupCount === 1 ? "appearance" : "appearances"} — view in Statistics`
                              return onViewLineupStats ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onViewLineupStats(p.id)
                                  }}
                                  className="text-[10px] text-primary border border-primary/40 hover:bg-primary/10 rounded px-1 py-0.5 transition-colors"
                                  aria-label={label}
                                  title={label}
                                >
                                  {lineupCount} lineup{lineupCount === 1 ? "" : "s"}
                                </button>
                              ) : (
                                <span
                                  className="text-[10px] text-muted-foreground border border-border rounded px-1 py-0.5"
                                  title={label}
                                >
                                  {lineupCount} lineup{lineupCount === 1 ? "" : "s"}
                                </span>
                              )
                            })()}
                            {p.bookingCount !== undefined && p.bookingCount > 0 && (
                              <span
                                className="text-[10px] text-muted-foreground border border-border rounded px-1 py-0.5"
                                title="Bookings sent from this device"
                              >
                                {p.bookingCount}×
                              </span>
                            )}
                            {p.gender && (
                              <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
                                {p.gender === "Non-Binary" ? "NB" : p.gender.charAt(0)}
                              </span>
                            )}
                            {p.lgbtq && (
                              <span className="text-[10px] text-purple-500 dark:text-purple-400 hidden sm:inline">
                                LGBTQ+
                              </span>
                            )}
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
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => setExpandedId(isExpanded ? null : p.id)}
                              aria-label={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="border-t border-border/40 bg-muted/20">
                            {/* Profile info only — Likes/Dislikes moved to edit form (feature 2) */}
                            <div className="px-4 py-3 space-y-3 text-xs">
                              <div>
                                <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground mb-1.5">
                                  Contact
                                </p>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                                  <div>
                                    <dt className="text-muted-foreground">Email</dt>
                                    <dd className="text-foreground">{p.email || "—"}</dd>
                                  </div>
                                  {p.additionalEmail && (
                                    <div>
                                      <dt className="text-muted-foreground">Alt email</dt>
                                      <dd className="text-foreground">{p.additionalEmail}</dd>
                                    </div>
                                  )}
                                  {p.phone && (
                                    <div>
                                      <dt className="text-muted-foreground">Phone</dt>
                                      <dd className="text-foreground">{p.phone}</dd>
                                    </div>
                                  )}
                                </dl>
                              </div>
                              <div className="border-t border-border/40 pt-3">
                                <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground mb-1.5">
                                  Demographics
                                </p>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                                  {p.gender && (
                                    <div>
                                      <dt className="text-muted-foreground">Gender</dt>
                                      <dd className="text-foreground">{p.gender}</dd>
                                    </div>
                                  )}
                                  {p.races && p.races.length > 0 && (
                                    <div>
                                      <dt className="text-muted-foreground">
                                        {p.races.length === 1 ? "Race" : "Races"}
                                      </dt>
                                      <dd className="text-foreground">{p.races.join(", ")}</dd>
                                    </div>
                                  )}
                                  <div>
                                    <dt className="text-muted-foreground">LGBTQ+</dt>
                                    <dd className="text-foreground">{p.lgbtq ? "Yes" : "No"}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-muted-foreground">Times booked</dt>
                                    <dd className="text-foreground">{p.bookingCount ?? 0}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-muted-foreground">Lineup appearances</dt>
                                    <dd className="text-foreground">
                                      {(() => {
                                        const lineupCount = lineupAppearancesById?.get(p.id) ?? 0
                                        if (lineupCount === 0) {
                                          return <span className="text-muted-foreground">0</span>
                                        }
                                        return onViewLineupStats ? (
                                          <button
                                            type="button"
                                            onClick={() => onViewLineupStats(p.id)}
                                            className="text-primary hover:underline"
                                            aria-label={`View ${p.name}'s ${lineupCount} lineup appearances in Statistics`}
                                          >
                                            {lineupCount} →
                                          </button>
                                        ) : (
                                          <>{lineupCount}</>
                                        )
                                      })()}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                              <div className="border-t border-border/40 pt-2">
                                <button
                                  type="button"
                                  onClick={() => startEdit(p)}
                                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Edit profile &amp; likes/dislikes
                                </button>
                              </div>
                            </div>
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
      <p className="text-[11px] text-muted-foreground text-right">
        {filteredPerformers.length} of {performers.length} performers
      </p>
    </div>
  )
}
