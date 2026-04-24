"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AsssscatPerformerPanel } from "@/components/asssscat-performer-panel"
import { CastDirectory } from "@/components/cast-directory"
import { CcEmailList } from "@/components/cc-email-list"
import { ToolPage } from "@/components/tool-page"
import {
  ASSSSCAT_MAX_IMPROVISERS,
  ASSSSCAT_SMALL_CAST_THRESHOLD,
  ASSSSCAT_TO,
  renderAsssscatBody,
  renderAsssscatSubject,
} from "@/lib/emails"
import {
  loadPerformers,
  savePerformers,
  parseCastInput,
  matchPerformersByName,
  incrementBookingCounts,
} from "@/lib/asssscat-performers"
import {
  loadAsssscatDefaultCc,
  saveAsssscatDefaultCc,
} from "@/lib/asssscat-preferences"
import {
  getIncompatiblePairs,
  loadCompatibility,
  removePerformerCompatibility,
  saveCompatibility,
  setPerformerCompatibility,
} from "@/lib/asssscat-compatibility"
import {
  loadBookingDrafts,
  saveBookingDraft,
  deleteBookingDraft,
  newDraftId,
  type BookingDraft,
} from "@/lib/asssscat-bookings"
import type {
  AsssscatMonologist,
  AsssscatPerformer,
  AsssscatShowDetails,
  CompatibilityMap,
} from "@/lib/types"
import { AlertTriangle, Calendar, Check, Pencil, Plus, Send, Trash2, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"

const inputClasses =
  "bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-10 placeholder:text-muted-foreground"

type SendStatus =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; id?: string }
  | { kind: "error"; message: string }

export function AsssscatApp() {
  const [performers, setPerformers] = useState<AsssscatPerformer[]>([])
  const [compatibility, setCompatibility] = useState<CompatibilityMap>({})
  const [cast, setCast] = useState<AsssscatPerformer[]>([])
  const [showDate, setShowDate] = useState("")
  const [monologist, setMonologist] = useState<AsssscatMonologist>({
    name: "",
    link: "",
    credits: "",
  })
  const [ticketLink, setTicketLink] = useState("")
  const [oneTimeCc, setOneTimeCc] = useState<string[]>([])
  const [defaultCc, setDefaultCc] = useState<string[]>([])
  const [castInput, setCastInput] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sendStatus, setSendStatus] = useState<SendStatus>({ kind: "idle" })
  const [activeTab, setActiveTab] = useState("booking")

  // Available performers filter (feature 4)
  const [availableInput, setAvailableInput] = useState("")
  const [filterByAvailable, setFilterByAvailable] = useState(false)

  // Bookings tab state (feature 3)
  const [bookingDrafts, setBookingDrafts] = useState<BookingDraft[]>([])
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)

  useEffect(() => {
    setPerformers(loadPerformers())
    setDefaultCc(loadAsssscatDefaultCc())
    setCompatibility(loadCompatibility())
    setBookingDrafts(loadBookingDrafts())
  }, [])

  const handlePerformersChange = (next: AsssscatPerformer[]) => {
    const saved = savePerformers(next)
    setPerformers(saved)
    setCast((current) =>
      current
        .map((p) => saved.find((s) => s.id === p.id) ?? null)
        .filter((p): p is AsssscatPerformer => p !== null),
    )
  }

  const handleCompatibilityChange = (performerId: string, patch: { likes?: string[]; dislikes?: string[] }) => {
    setCompatibility((current) => setPerformerCompatibility(current, performerId, patch))
  }

  const handlePerformerRemoved = (performerId: string) => {
    setCompatibility((current) => removePerformerCompatibility(current, performerId))
  }

  const handleCompatibilitySave = (map: CompatibilityMap) => {
    setCompatibility(saveCompatibility(map))
  }

  const handleDefaultCcChange = (next: string[]) => {
    setDefaultCc(saveAsssscatDefaultCc(next))
  }

  const handlePickPerformer = (p: AsssscatPerformer) => {
    setCast((current) => {
      if (current.some((c) => c.id === p.id)) return current
      if (current.length >= ASSSSCAT_MAX_IMPROVISERS) return current
      return [...current, p]
    })
  }

  const handleRemoveFromCast = (id: string) => {
    setCast((current) => current.filter((p) => p.id !== id))
  }

  const showDetails: AsssscatShowDetails = useMemo(
    () => ({
      showDate,
      improvisers: cast,
      monologist,
      ticketLink,
      oneTimeCc,
      defaultCc,
    }),
    [showDate, cast, monologist, ticketLink, oneTimeCc, defaultCc],
  )

  const emailPreview = useMemo(
    () => renderAsssscatBody({ showDetails }),
    [showDetails],
  )
  const subjectPreview = useMemo(
    () => renderAsssscatSubject(showDetails),
    [showDetails],
  )

  const castInputNames = useMemo(() => parseCastInput(castInput), [castInput])
  const castInputMatches = useMemo(
    () => matchPerformersByName(castInputNames, performers),
    [castInputNames, performers],
  )

  const handleApplyCastInput = () => {
    const toAdd = castInputMatches
      .filter((r) => r.matched !== null)
      .map((r) => r.matched!)
    for (const p of toAdd) {
      handlePickPerformer(p)
    }
    setCastInput("")
  }

  const castIds = useMemo(() => cast.map((p) => p.id), [cast])
  const incompatiblePairs = useMemo(
    () => getIncompatiblePairs(castIds, compatibility),
    [castIds, compatibility],
  )

  // Available performers filter: compute the set of matched IDs
  const availableNames = useMemo(() => parseCastInput(availableInput), [availableInput])
  const availableMatches = useMemo(
    () => matchPerformersByName(availableNames, performers),
    [availableNames, performers],
  )
  const availableIds = useMemo(
    () => new Set(availableMatches.filter((r) => r.matched !== null).map((r) => r.matched!.id)),
    [availableMatches],
  )

  const isSmallCast = cast.length < ASSSSCAT_SMALL_CAST_THRESHOLD
  const canSubmit =
    showDate.length > 0 && cast.length > 0 && sendStatus.kind !== "sending"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    if (isSmallCast) {
      setConfirmOpen(true)
      return
    }
    void send(false)
  }

  const send = async (smallCastAcknowledged: boolean) => {
    setConfirmOpen(false)
    setSendStatus({ kind: "sending" })
    try {
      const response = await fetch("/api/asssscat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showDate,
          improvisers: cast,
          monologist,
          ticketLink,
          oneTimeCc,
          defaultCc,
          emailSubject: subjectPreview,
          emailBody: emailPreview,
          smallCastAcknowledged,
        }),
      })

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After")) || 10
        setSendStatus({
          kind: "error",
          message: `Too many requests. Please wait ${retryAfter}s and try again.`,
        })
        return
      }

      const data = (await response.json()) as {
        email?: { status: string; id?: string; error?: string }
        error?: string
      }

      if (!response.ok || data.email?.status !== "success") {
        setSendStatus({
          kind: "error",
          message: data.email?.error || data.error || "Failed to send email.",
        })
        return
      }

      setSendStatus({ kind: "success", id: data.email.id })
      setOneTimeCc([])
      const bookedIds = cast.map((p) => p.id)
      setPerformers((current) => incrementBookingCounts(current, bookedIds))
      // Remove from bookings if this was a draft
      if (activeDraftId) {
        setBookingDrafts(deleteBookingDraft(activeDraftId))
        setActiveDraftId(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error"
      setSendStatus({ kind: "error", message })
    }
  }

  // Save current booking form as a draft
  const handleSaveDraft = () => {
    const id = activeDraftId ?? newDraftId()
    const draft: BookingDraft = {
      id,
      showDate,
      monologist,
      ticketLink,
      cast,
      oneTimeCc,
      savedAt: new Date().toISOString(),
    }
    setBookingDrafts(saveBookingDraft(draft))
    setActiveDraftId(id)
  }

  // Load a draft into the booking form and switch to booking tab
  const handleLoadDraft = (draft: BookingDraft) => {
    setShowDate(draft.showDate)
    setMonologist(draft.monologist)
    setTicketLink(draft.ticketLink)
    setCast(draft.cast.filter((c) => performers.some((p) => p.id === c.id)))
    setOneTimeCc(draft.oneTimeCc)
    setActiveDraftId(draft.id)
    setSendStatus({ kind: "idle" })
    setActiveTab("booking")
  }

  const handleDeleteDraft = (id: string) => {
    setBookingDrafts(deleteBookingDraft(id))
    if (activeDraftId === id) setActiveDraftId(null)
  }

  const handleNewBooking = () => {
    setShowDate("")
    setMonologist({ name: "", link: "", credits: "" })
    setTicketLink("")
    setCast([])
    setOneTimeCc([])
    setActiveDraftId(null)
    setSendStatus({ kind: "idle" })
    setActiveTab("booking")
  }

  return (
    <ToolPage
      title="ASSSSCAT"
      description="Send the cast booking email for ASSSSCAT at UCB Franklin Theatre."
      size="lg"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="booking">
            {activeDraftId ? "Booking Draft" : "Booking"}
          </TabsTrigger>
          <TabsTrigger value="bookings">
            Bookings
            {bookingDrafts.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-primary/20 text-primary rounded-full min-w-[16px] h-4 px-1 inline-flex items-center justify-center font-semibold">
                {bookingDrafts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="directory">Cast Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <CastDirectory
            performers={performers}
            onChange={handlePerformersChange}
            onPerformerRemoved={handlePerformerRemoved}
            compatibility={compatibility}
            onCompatibilityChange={handleCompatibilityChange}
          />
        </TabsContent>

        <TabsContent value="bookings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-foreground">Upcoming shows</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Up to {10} saved booking drafts, sorted by show date.
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={handleNewBooking}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                New booking
              </Button>
            </div>

            {bookingDrafts.length === 0 ? (
              <div className="border border-border rounded-lg bg-card px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No saved bookings yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fill out the Booking tab and click &ldquo;Save draft&rdquo; to save a show here.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-lg bg-card divide-y divide-border overflow-hidden">
                {bookingDrafts.map((draft) => {
                  const isActive = draft.id === activeDraftId
                  const dateLabel = draft.showDate
                    ? new Date(draft.showDate + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No date"
                  return (
                    <div
                      key={draft.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 group",
                        isActive && "bg-primary/5",
                      )}
                    >
                      <button
                        type="button"
                        className="flex-1 text-left min-w-0"
                        onClick={() => handleLoadDraft(draft)}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className={cn("text-sm font-medium", isActive ? "text-primary" : "text-foreground")}>
                            {dateLabel}
                          </span>
                          {isActive && (
                            <span className="text-[10px] bg-primary/15 text-primary rounded px-1.5 py-0.5 font-medium">
                              active
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 ml-5">
                          {draft.cast.length > 0
                            ? `${draft.cast.length} improviser${draft.cast.length !== 1 ? "s" : ""}${draft.monologist.name ? ` · ${draft.monologist.name}` : ""}`
                            : draft.monologist.name || "No cast yet"}
                        </div>
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoadDraft(draft)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1"
                          title="Open booking draft"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
                          title="Delete draft"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="booking">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
        <aside>
          <AsssscatPerformerPanel
            performers={performers}
            onChange={handlePerformersChange}
            onPickPerformer={handlePickPerformer}
            selectedIds={castIds}
            canAddMore={cast.length < ASSSSCAT_MAX_IMPROVISERS}
            compatibility={compatibility}
            onCompatibilityChange={handleCompatibilityChange}
            onCompatibilitySave={handleCompatibilitySave}
            onPerformerRemoved={handlePerformerRemoved}
            availableFilter={filterByAvailable ? availableIds : null}
          />
        </aside>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="border border-border rounded-lg bg-card p-5 space-y-5">
            <div>
              <h2 className="text-sm font-medium text-foreground">Show</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Sends to {ASSSSCAT_TO} with the cast on BCC.
              </p>
            </div>

            <Field>
              <FieldLabel htmlFor="showDate" className="text-xs">
                <Calendar className="inline-block h-3 w-3 mr-1.5 -mt-0.5 opacity-70" />
                Show date
              </FieldLabel>
              <Input
                id="showDate"
                type="date"
                value={showDate}
                onChange={(e) => setShowDate(e.target.value)}
                className={inputClasses}
                required
              />
            </Field>

            {/* Available performers filter (feature 4) */}
            <div>
              <Label className="text-xs">
                Available performers
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                Paste a list of performers available for this date to filter the panel.
              </p>
              <Textarea
                value={availableInput}
                onChange={(e) => setAvailableInput(e.target.value)}
                placeholder={"Jane Doe\nJohn Smith\n..."}
                className="font-mono text-xs min-h-[64px] bg-input border-border resize-none"
              />
              {availableNames.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {availableIds.size} of {availableNames.length} matched
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilterByAvailable((v) => !v)}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded border transition-colors",
                      filterByAvailable
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {filterByAvailable ? "Showing available only" : "Show available only"}
                  </button>
                  {filterByAvailable && (
                    <button
                      type="button"
                      onClick={() => setFilterByAvailable(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Show all
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="castInput" className="text-xs">
                Paste cast list
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                One name per line (or comma-separated). Matched performers are resolved automatically.
              </p>
              <Textarea
                id="castInput"
                value={castInput}
                onChange={(e) => setCastInput(e.target.value)}
                placeholder={"Jane Doe\nJohn Smith\n..."}
                className="font-mono text-xs min-h-[80px] bg-input border-border resize-none"
              />
              {castInputNames.length > 0 && (
                <div className="mt-2 space-y-1">
                  {castInputMatches.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {r.matched ? (
                        <>
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400 shrink-0" />
                          <span className="text-foreground">{r.matched.name}</span>
                          <span className="text-muted-foreground truncate">{r.matched.email}</span>
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 text-destructive shrink-0" />
                          <span className="text-muted-foreground line-through">{r.input}</span>
                          <span className="text-destructive">not found</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {castInputMatches.some((r) => r.matched !== null) && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="mt-2 h-8 text-xs"
                  onClick={handleApplyCastInput}
                >
                  Add {castInputMatches.filter((r) => r.matched !== null).length} to cast
                </Button>
              )}
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1.5">
                <Users className="h-3 w-3 opacity-70" />
                Cast ({cast.length}/{ASSSSCAT_MAX_IMPROVISERS})
              </Label>
              <ol className="mt-2 space-y-1.5">
                {Array.from({ length: ASSSSCAT_MAX_IMPROVISERS }).map((_, i) => {
                  const performer = cast[i]
                  const isIncompat = performer
                    ? incompatiblePairs.some((pair) => pair.includes(performer.id))
                    : false
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex items-center gap-2 border rounded-md px-3 py-2",
                        isIncompat
                          ? "border-destructive/60 bg-destructive/10"
                          : "border-border bg-input",
                      )}
                    >
                      <span className="text-xs text-muted-foreground w-5">
                        {i + 1}.
                      </span>
                      {performer ? (
                        <>
                          {isIncompat && (
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" aria-label="Compatibility conflict" />
                          )}
                          <span className="text-sm text-foreground flex-1 truncate">
                            {performer.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate hidden sm:block">
                            {performer.email}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCast(performer.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Remove ${performer.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Click a performer to add
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>
              {incompatiblePairs.length > 0 && (
                <div className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 space-y-1">
                  {incompatiblePairs.map(([aId, bId], idx) => {
                    const a = cast.find((p) => p.id === aId)
                    const b = cast.find((p) => p.id === bId)
                    if (!a || !b) return null
                    return (
                      <p key={idx} className="text-xs text-destructive flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        {a.name} and {b.name} have a compatibility conflict.
                      </p>
                    )
                  })}
                </div>
              )}
              {isSmallCast && cast.length > 0 && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Fewer than {ASSSSCAT_SMALL_CAST_THRESHOLD} improvisers — you&apos;ll
                  be asked to confirm before sending.
                </p>
              )}
            </div>
          </section>

          <section className="border border-border rounded-lg bg-card p-5 space-y-4">
            <h2 className="text-sm font-medium text-foreground">Monologist</h2>
            <Field>
              <FieldLabel htmlFor="monoName" className="text-xs">Name</FieldLabel>
              <Input
                id="monoName"
                value={monologist.name}
                onChange={(e) =>
                  setMonologist((m) => ({ ...m, name: e.target.value }))
                }
                className={inputClasses}
                placeholder="Monologist name"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="monoLink" className="text-xs">
                Link (social media / Wikipedia)
              </FieldLabel>
              <Input
                id="monoLink"
                type="url"
                value={monologist.link}
                onChange={(e) =>
                  setMonologist((m) => ({ ...m, link: e.target.value }))
                }
                className={inputClasses}
                placeholder="https://"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="monoCredits" className="text-xs">
                Credits
              </FieldLabel>
              <Input
                id="monoCredits"
                value={monologist.credits}
                onChange={(e) =>
                  setMonologist((m) => ({ ...m, credits: e.target.value }))
                }
                className={inputClasses}
                placeholder="SNL, Hacks, etc."
              />
            </Field>
          </section>

          <section className="border border-border rounded-lg bg-card p-5 space-y-4">
            <h2 className="text-sm font-medium text-foreground">Ticket link</h2>
            <Field>
              <FieldLabel htmlFor="ticketLink" className="text-xs">
                URL
              </FieldLabel>
              <Input
                id="ticketLink"
                type="url"
                value={ticketLink}
                onChange={(e) => setTicketLink(e.target.value)}
                className={inputClasses}
                placeholder="https://"
              />
            </Field>
          </section>

          <section className="border border-border rounded-lg bg-card p-5 space-y-4">
            <h2 className="text-sm font-medium text-foreground">CC</h2>
            <div>
              <Label htmlFor="oneTimeCc" className="text-xs">
                One-time CC
              </Label>
              <div className="mt-2">
                <CcEmailList
                  inputId="oneTimeCc"
                  emails={oneTimeCc}
                  onChange={setOneTimeCc}
                  emptyHint="Added only to this send."
                />
              </div>
            </div>
            <div>
              <Label htmlFor="defaultCc" className="text-xs">
                Default CC (saved on this device)
              </Label>
              <div className="mt-2">
                <CcEmailList
                  inputId="defaultCc"
                  emails={defaultCc}
                  onChange={handleDefaultCcChange}
                  emptyHint="Persistent — used for every ASSSSCAT send."
                />
              </div>
            </div>
          </section>

          <section className="border border-border rounded-lg bg-card p-5 space-y-3">
            <div>
              <h2 className="text-sm font-medium text-foreground">
                Email preview
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Subject: {subjectPreview}
              </p>
            </div>
            <Textarea
              value={emailPreview}
              readOnly
              className="font-mono text-xs min-h-[320px] bg-input border-border"
            />
          </section>

          {sendStatus.kind === "success" && (
            <div className="rounded-md border border-green-600/40 bg-green-600/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              Email sent.
            </div>
          )}
          {sendStatus.kind === "error" && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {sendStatus.message}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={handleSaveDraft}
            >
              {activeDraftId ? "Update draft" : "Save draft"}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11"
              size="lg"
              disabled={!canSubmit}
            >
              {sendStatus.kind === "sending" ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send booking email
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Small cast</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure this is the entire cast? Seems pretty small...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={() => void send(true)}>
              Send anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </TabsContent>
      </Tabs>
    </ToolPage>
  )
}
