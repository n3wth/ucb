"use client"

import { useEffect, useMemo, useState } from "react"
import { formInputClassName } from "@/lib/site-chrome"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  loadLineupLog,
  saveLineupEntry,
  deleteLineupEntry,
  newLineupId,
  type LineupEntry,
  type LineupPerformer,
} from "@/lib/asssscat-lineup-log"
import { matchPerformersByName, parseCastInput } from "@/lib/asssscat-performers"
import type { AsssscatPerformer } from "@/lib/types"
import { Pencil, Plus, Save, Trash2, X } from "lucide-react"

const inputClasses = formInputClassName()

interface AsssscatLineupLogProps {
  performers: AsssscatPerformer[]
  // Notified whenever the entry list changes so the parent can refresh
  // appearance counts and the stats tab.
  onEntriesChange?: (entries: LineupEntry[]) => void
}

interface EditState {
  id: string
  showDate: string
  monologistName: string
  performersText: string
}

function performersToText(performers: LineupPerformer[]): string {
  return performers.map((p) => p.name).join(", ")
}

function buildPerformers(
  text: string,
  directory: AsssscatPerformer[],
): LineupPerformer[] {
  const names = parseCastInput(text)
  const matches = matchPerformersByName(names, directory)
  return matches.map((m) => ({
    name: m.input,
    performerId: m.matched ? m.matched.id : null,
  }))
}

function formatShowDate(iso: string): string {
  if (!iso) return "—"
  // Render in local timezone without converting away the calendar date.
  const [y, m, d] = iso.split("-").map((s) => Number(s))
  if (!y || !m || !d) return iso
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function AsssscatLineupLog({ performers, onEntriesChange }: AsssscatLineupLogProps) {
  const [entries, setEntries] = useState<LineupEntry[]>([])
  const [edit, setEdit] = useState<EditState | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadLineupLog().then((next) => {
      if (!cancelled) setEntries(next)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const updateEntries = (next: LineupEntry[]) => {
    setEntries(next)
    onEntriesChange?.(next)
  }

  const sorted = useMemo(() => entries, [entries])

  const startNew = () => {
    setEdit({
      id: newLineupId(),
      showDate: "",
      monologistName: "",
      performersText: "",
    })
  }

  const startEdit = (entry: LineupEntry) => {
    setEdit({
      id: entry.id,
      showDate: entry.showDate,
      monologistName: entry.monologistName,
      performersText: performersToText(entry.performers),
    })
  }

  const cancelEdit = () => setEdit(null)

  const saveEdit = async () => {
    if (!edit || !edit.showDate) return
    const existing = entries.find((e) => e.id === edit.id)
    const entry: LineupEntry = {
      id: edit.id,
      showDate: edit.showDate,
      monologistName: edit.monologistName.trim(),
      performers: buildPerformers(edit.performersText, performers),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    }
    setEdit(null)
    updateEntries(await saveLineupEntry(entry))
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const id = pendingDelete
    setPendingDelete(null)
    updateEntries(await deleteLineupEntry(id))
  }

  const editing = edit !== null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Lineup Log</h2>
          <p className="text-sm text-muted-foreground">
            Chronological record of past and upcoming ASSSSCAT lineups. New shows are
            recorded automatically when you send a booking.
          </p>
        </div>
        <Button onClick={startNew} disabled={editing} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add lineup
        </Button>
      </div>

      {editing && edit && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="lineup-date">Show date</Label>
              <Input
                id="lineup-date"
                type="date"
                value={edit.showDate}
                onChange={(e) => setEdit({ ...edit, showDate: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lineup-monologist">Monologist</Label>
              <Input
                id="lineup-monologist"
                value={edit.monologistName}
                onChange={(e) => setEdit({ ...edit, monologistName: e.target.value })}
                placeholder="Monologist name"
                className={inputClasses}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="lineup-performers">Performers (comma or newline separated)</Label>
            <Textarea
              id="lineup-performers"
              value={edit.performersText}
              onChange={(e) => setEdit({ ...edit, performersText: e.target.value })}
              placeholder="Alex Fernie, Betsy Sodaro, Brian Huskey..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={cancelEdit}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={() => void saveEdit()} disabled={!edit.showDate}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !editing ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No lineups yet. Send a booking from the Booking tab — it will be logged here
          automatically. You can also add past lineups manually.
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Date</TableHead>
                <TableHead className="w-[200px]">Monologist</TableHead>
                <TableHead>Performers</TableHead>
                <TableHead className="w-[110px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{formatShowDate(entry.showDate)}</TableCell>
                  <TableCell>{entry.monologistName || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {entry.performers.length === 0 ? (
                        <span className="text-muted-foreground text-sm">—</span>
                      ) : (
                        entry.performers.map((p, i) => (
                          <span
                            key={`${entry.id}-${i}`}
                            className={
                              p.performerId
                                ? "inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs"
                                : "inline-flex items-center rounded-full border border-dashed border-amber-500/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-xs"
                            }
                            title={p.performerId ? "Linked to Cast Directory" : "Not linked to a Cast Directory profile"}
                          >
                            {p.name}
                          </span>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(entry)}
                        disabled={editing}
                        aria-label="Edit lineup"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPendingDelete(entry.id)}
                        disabled={editing}
                        aria-label="Delete lineup"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lineup?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the entry from the log. Performance counts on cast profiles
              are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
