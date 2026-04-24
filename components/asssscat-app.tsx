"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"
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
} from "@/lib/asssscat-performers"
import {
  loadAsssscatDefaultCc,
  saveAsssscatDefaultCc,
} from "@/lib/asssscat-preferences"
import type {
  AsssscatMonologist,
  AsssscatPerformer,
  AsssscatShowDetails,
} from "@/lib/types"
import { Calendar, Send, Users, X } from "lucide-react"

const inputClasses =
  "bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-10 placeholder:text-muted-foreground"

type SendStatus =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; id?: string }
  | { kind: "error"; message: string }

export function AsssscatApp() {
  const [performers, setPerformers] = useState<AsssscatPerformer[]>([])
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sendStatus, setSendStatus] = useState<SendStatus>({ kind: "idle" })

  useEffect(() => {
    setPerformers(loadPerformers())
    setDefaultCc(loadAsssscatDefaultCc())
  }, [])

  const handlePerformersChange = (next: AsssscatPerformer[]) => {
    const saved = savePerformers(next)
    setPerformers(saved)
    // Keep the cast in sync with edits / deletions.
    setCast((current) =>
      current
        .map((p) => saved.find((s) => s.id === p.id) ?? null)
        .filter((p): p is AsssscatPerformer => p !== null),
    )
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error"
      setSendStatus({ kind: "error", message })
    }
  }

  return (
    <ToolPage
      title="ASSSSCAT"
      description="Send the cast booking email for ASSSSCAT at UCB Franklin Theatre."
      size="lg"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
        <aside>
          <AsssscatPerformerPanel
            performers={performers}
            onChange={handlePerformersChange}
            onPickPerformer={handlePickPerformer}
            selectedIds={cast.map((p) => p.id)}
            canAddMore={cast.length < ASSSSCAT_MAX_IMPROVISERS}
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

            <div>
              <Label className="text-xs flex items-center gap-1.5">
                <Users className="h-3 w-3 opacity-70" />
                Cast ({cast.length}/{ASSSSCAT_MAX_IMPROVISERS})
              </Label>
              <ol className="mt-2 space-y-1.5">
                {Array.from({ length: ASSSSCAT_MAX_IMPROVISERS }).map((_, i) => {
                  const performer = cast[i]
                  return (
                    <li
                      key={i}
                      className="flex items-center gap-2 border border-border rounded-md px-3 py-2 bg-input"
                    >
                      <span className="text-xs text-muted-foreground w-5">
                        {i + 1}.
                      </span>
                      {performer ? (
                        <>
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
              {isSmallCast && cast.length > 0 && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Fewer than {ASSSSCAT_SMALL_CAST_THRESHOLD} improvisers — you'll
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

          <Button
            type="submit"
            className="w-full h-11"
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
    </ToolPage>
  )
}
