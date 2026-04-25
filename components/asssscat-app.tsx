"use client"

import { useEffect, useMemo, useState } from "react"
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
import { AsssscatAvailablePanel } from "@/components/asssscat-available-panel"
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
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  Pencil,
  Plus,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const inputClasses =
  "bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-10 placeholder:text-muted-foreground"

type SendStatus =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; id?: string }
  | { kind: "error"; message: string }

type Stage = "compose" | "preview"

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
  const [oneTimeBcc, setOneTimeBcc] = useState<string[]>([])
  const [defaultCc, setDefaultCc] = useState<string[]>([])
  const [castInput, setCastInput] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sendStatus, setSendStatus] = useState<SendStatus>({ kind: "idle" })
  const [activeTab, setActiveTab] = useState("booking")
  const [stage, setStage] = useState<Stage>("compose")
  const [editedEmailBody, setEditedEmailBody] = useState<string | null>(null)

  // Available performers filter — chip list of pasted names
  const [availableNames, setAvailableNames] = useState<string[]>([])
  const [filterByAvailable, setFilterByAvailable] = useState(false)

  // Bookings tab state
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

  const handleCompatibilityChange = (
    performerId: string,
    patch: { likes?: string[]; dislikes?: string[] },
  ) => {
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

  const PERFORMER_DRAG_TYPE = "application/x-asssscat-performer-id"
  const [castDragActive, setCastDragActive] = useState(false)

  const handleCastDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(PERFORMER_DRAG_TYPE)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    if (!castDragActive) setCastDragActive(true)
  }

  const handleCastDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    setCastDragActive(false)
  }

  const handleCastDrop = (e: React.DragEvent) => {
    const id = e.dataTransfer.getData(PERFORMER_DRAG_TYPE)
    setCastDragActive(false)
    if (!id) return
    e.preventDefault()
    const performer = performers.find((p) => p.id === id)
    if (!performer) return
    handlePickPerformer(performer)
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

  const renderedBody = useMemo(
    () => renderAsssscatBody({ showDetails }),
    [showDetails],
  )
  const subjectPreview = useMemo(
    () => renderAsssscatSubject(showDetails),
    [showDetails],
  )
  const emailBody = editedEmailBody ?? renderedBody

  // If user enters preview, edits, then leaves to compose, drop their edits
  // so the preview reflects current form state on re-entry.
  useEffect(() => {
    if (stage === "compose" && editedEmailBody !== null) {
      setEditedEmailBody(null)
    }
  }, [stage, editedEmailBody])

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

  const availableMatches = useMemo(
    () => matchPerformersByName(availableNames, performers),
    [availableNames, performers],
  )
  const availableIds = useMemo(
    () =>
      new Set(
        availableMatches.filter((r) => r.matched !== null).map((r) => r.matched!.id),
      ),
    [availableMatches],
  )

  const isSmallCast = cast.length < ASSSSCAT_SMALL_CAST_THRESHOLD
  const canProceedToPreview = showDate.length > 0 && cast.length > 0
  const canSend = canProceedToPreview && sendStatus.kind !== "sending"

  const handleProceedToPreview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canProceedToPreview) return
    setEditedEmailBody(null)
    setSendStatus({ kind: "idle" })
    setStage("preview")
  }

  const handleSendClick = () => {
    if (!canSend) return
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
          oneTimeBcc,
          emailSubject: subjectPreview,
          emailBody,
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
      setOneTimeBcc([])
      const bookedIds = cast.map((p) => p.id)
      setPerformers((current) => incrementBookingCounts(current, bookedIds))
      if (activeDraftId) {
        setBookingDrafts(deleteBookingDraft(activeDraftId))
        setActiveDraftId(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error"
      setSendStatus({ kind: "error", message })
    }
  }

  const handleSaveDraft = () => {
    const id = activeDraftId ?? newDraftId()
    const draft: BookingDraft = {
      id,
      showDate,
      monologist,
      ticketLink,
      cast,
      oneTimeCc,
      oneTimeBcc,
      savedAt: new Date().toISOString(),
    }
    setBookingDrafts(saveBookingDraft(draft))
    setActiveDraftId(id)
  }

  const handleLoadDraft = (draft: BookingDraft) => {
    setShowDate(draft.showDate)
    setMonologist(draft.monologist)
    setTicketLink(draft.ticketLink)
    setCast(draft.cast.filter((c) => performers.some((p) => p.id === c.id)))
    setOneTimeCc(draft.oneTimeCc)
    setOneTimeBcc(draft.oneTimeBcc ?? [])
    setActiveDraftId(draft.id)
    setSendStatus({ kind: "idle" })
    setStage("compose")
    setEditedEmailBody(null)
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
    setOneTimeBcc([])
    setActiveDraftId(null)
    setSendStatus({ kind: "idle" })
    setStage("compose")
    setEditedEmailBody(null)
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
            Drafts
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
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={handleNewBooking}
              >
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
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isActive ? "text-primary" : "text-foreground",
                            )}
                          >
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
          <StageProgress current={stage} />

          {stage === "compose" && (
            <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_260px] gap-6 mt-6">
              {/* LEFT: Show, Ticket, CC, BCC */}
              <aside className="space-y-4 order-2 lg:order-1">
                <section className="border border-border rounded-lg bg-card p-4 space-y-4">
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

                  <Field>
                    <FieldLabel htmlFor="ticketLink" className="text-xs">
                      Ticket link
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

                <section className="border border-border rounded-lg bg-card p-4 space-y-4">
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

                <section className="border border-border rounded-lg bg-card p-4 space-y-2">
                  <h2 className="text-sm font-medium text-foreground">BCC</h2>
                  <p className="text-xs text-muted-foreground">
                    Cast emails are BCC&apos;d automatically. Add extras here.
                  </p>
                  <div className="mt-1">
                    <CcEmailList
                      inputId="oneTimeBcc"
                      emails={oneTimeBcc}
                      onChange={setOneTimeBcc}
                      emptyHint="Added only to this send."
                    />
                  </div>
                </section>
              </aside>

              {/* CENTER: Cast + Monologist */}
              <form
                onSubmit={handleProceedToPreview}
                className="space-y-6 order-1 lg:order-2"
              >
                <section className="border border-border rounded-lg bg-card p-5 space-y-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 opacity-70" />
                      CAST ({cast.length}/{ASSSSCAT_MAX_IMPROVISERS})
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-3">
                    Click or drag a performer from the panel to add them to the cast.
                  </p>

                  <div>
                    <Label htmlFor="castInput" className="text-xs">
                      Paste cast list
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                      One name per line (or comma-separated). Matched performers are resolved
                      automatically.
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
                                <span className="text-muted-foreground truncate">
                                  {r.matched.email}
                                </span>
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 text-destructive shrink-0" />
                                <span className="text-muted-foreground line-through">
                                  {r.input}
                                </span>
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
                        Add{" "}
                        {castInputMatches.filter((r) => r.matched !== null).length} to cast
                      </Button>
                    )}
                  </div>

                  {cast.length > 0 && (
                    <ol
                      className={cn(
                        "space-y-1.5 rounded-md p-1 transition-colors",
                        castDragActive
                          ? "outline-2 outline-dashed outline-primary/60 bg-primary/5"
                          : "outline-2 outline-transparent",
                      )}
                      onDragOver={handleCastDragOver}
                      onDragLeave={handleCastDragLeave}
                      onDrop={handleCastDrop}
                      aria-label="Cast members"
                    >
                      {cast.map((performer, i) => {
                        const isIncompat = incompatiblePairs.some((pair) =>
                          pair.includes(performer.id),
                        )
                        return (
                          <li
                            key={performer.id}
                            className={cn(
                              "flex items-center gap-2 border rounded-md px-3 py-2 transition-colors",
                              isIncompat
                                ? "border-destructive/60 bg-destructive/10"
                                : "border-border bg-input",
                            )}
                          >
                            <span className="text-xs text-muted-foreground w-5">
                              {i + 1}.
                            </span>
                            {isIncompat && (
                              <AlertTriangle
                                className="h-3.5 w-3.5 text-destructive shrink-0"
                                aria-label="Compatibility conflict"
                              />
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
                          </li>
                        )
                      })}
                    </ol>
                  )}

                  {cast.length === 0 && (
                    <div
                      className={cn(
                        "rounded-md border border-dashed px-3 py-6 text-center transition-colors",
                        castDragActive
                          ? "border-primary/60 bg-primary/5"
                          : "border-border bg-input/40",
                      )}
                      onDragOver={handleCastDragOver}
                      onDragLeave={handleCastDragLeave}
                      onDrop={handleCastDrop}
                    >
                      <p className="text-xs text-muted-foreground italic">
                        {castDragActive ? "Drop to add" : "No cast members yet."}
                      </p>
                    </div>
                  )}

                  {incompatiblePairs.length > 0 && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 space-y-1">
                      {incompatiblePairs.map(([aId, bId], idx) => {
                        const a = cast.find((p) => p.id === aId)
                        const b = cast.find((p) => p.id === bId)
                        if (!a || !b) return null
                        return (
                          <p
                            key={idx}
                            className="text-xs text-destructive flex items-center gap-1.5"
                          >
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            {a.name} and {b.name} have a compatibility conflict.
                          </p>
                        )
                      })}
                    </div>
                  )}
                  {isSmallCast && cast.length > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Fewer than {ASSSSCAT_SMALL_CAST_THRESHOLD} improvisers — you&apos;ll
                      be asked to confirm before sending.
                    </p>
                  )}
                </section>

                <section className="border border-border rounded-lg bg-card p-5 space-y-4">
                  <h2 className="text-sm font-medium text-foreground">Monologist</h2>
                  <Field>
                    <FieldLabel htmlFor="monoName" className="text-xs">
                      Name
                    </FieldLabel>
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
                    disabled={!canProceedToPreview}
                  >
                    Review &amp; preview email
                  </Button>
                </div>
              </form>

              {/* RIGHT: Availability above Performers */}
              <aside className="space-y-3 order-3">
                <AsssscatAvailablePanel
                  performers={performers}
                  names={availableNames}
                  onChange={setAvailableNames}
                  filterActive={filterByAvailable}
                  onFilterToggle={setFilterByAvailable}
                />
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
            </div>
          )}

          {stage === "preview" && (
            <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="space-y-1.5">
                <h2 className="text-lg font-medium text-foreground">Review &amp; send</h2>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Nothing is sent until you confirm. You can edit the email below.
                </p>
              </div>

              <section className="border border-border rounded-lg bg-card p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <SummaryItem
                    label="To"
                    value={ASSSSCAT_TO}
                  />
                  <SummaryItem
                    label="Show date"
                    value={
                      showDate
                        ? new Date(showDate + "T12:00:00").toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "—"
                    }
                  />
                  <SummaryItem
                    label="Cast"
                    value={
                      cast.length > 0
                        ? cast.map((p) => p.name).join(", ")
                        : "—"
                    }
                  />
                  <SummaryItem
                    label="Monologist"
                    value={monologist.name || "—"}
                  />
                  <SummaryItem
                    label="Ticket link"
                    value={ticketLink || "—"}
                  />
                  <SummaryItem
                    label="CC"
                    value={
                      [...defaultCc, ...oneTimeCc].length > 0
                        ? [...defaultCc, ...oneTimeCc].join(", ")
                        : "—"
                    }
                  />
                  <SummaryItem
                    label="BCC"
                    value={
                      [...cast.map((c) => c.email), ...oneTimeBcc].length > 0
                        ? [...cast.map((c) => c.email), ...oneTimeBcc].join(", ")
                        : "—"
                    }
                  />
                </div>
              </section>

              <section className="border border-border rounded-lg bg-card p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Email</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Subject: {subjectPreview}
                    </p>
                  </div>
                  {editedEmailBody !== null && (
                    <button
                      type="button"
                      onClick={() => setEditedEmailBody(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Reset to default
                    </button>
                  )}
                </div>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEditedEmailBody(e.target.value)}
                  className="font-mono text-xs min-h-[360px] bg-input border-border"
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

              <div className="sticky bottom-4 z-10">
                <div className="flex gap-2 rounded-lg border border-border bg-card shadow-lg p-2">
                  <Button
                    variant="ghost"
                    onClick={() => setStage("compose")}
                    disabled={sendStatus.kind === "sending"}
                    className="flex-1 h-10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to edit
                  </Button>
                  <Button
                    onClick={handleSendClick}
                    disabled={!canSend}
                    className="flex-1 h-10"
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
              </div>
            </div>
          )}

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

const STAGES: { key: Stage; label: string }[] = [
  { key: "compose", label: "Details" },
  { key: "preview", label: "Review & send" },
]

function StageProgress({ current }: { current: Stage }) {
  const currentIdx = STAGES.findIndex((s) => s.key === current)
  return (
    <nav aria-label="Progress" className="w-full max-w-xs">
      <ol className="flex items-center justify-between">
        {STAGES.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx
          const isLast = idx === STAGES.length - 1
          return (
            <li key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                    (done || active) && "bg-primary text-primary-foreground",
                    !done && !active && "bg-muted text-muted-foreground border border-border",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : idx + 1}
                </div>
                <span
                  className={cn(
                    "text-xs transition-colors whitespace-nowrap",
                    done || active ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 mx-3 mb-5">
                  <div
                    className={cn(
                      "h-px w-full transition-colors",
                      idx < currentIdx ? "bg-primary" : "bg-border",
                    )}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
        {label}
      </div>
      <div className="text-xs text-foreground break-words">{value}</div>
    </div>
  )
}
