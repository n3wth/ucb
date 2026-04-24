// Browser-local storage for ASSSSCAT show booking drafts.
// Up to 10 upcoming show emails, sorted by show date.

import type { AsssscatMonologist, AsssscatPerformer } from '@/lib/types'

const STORAGE_KEY = 'ucb.asssscat.booking-drafts'
export const MAX_BOOKING_DRAFTS = 10

export interface BookingDraft {
  id: string
  showDate: string
  monologist: AsssscatMonologist
  ticketLink: string
  cast: AsssscatPerformer[]
  oneTimeCc: string[]
  savedAt: string
}

function isDraft(value: unknown): value is BookingDraft {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.showDate === 'string' &&
    typeof v.monologist === 'object' &&
    v.monologist !== null &&
    typeof v.ticketLink === 'string' &&
    Array.isArray(v.cast) &&
    Array.isArray(v.oneTimeCc) &&
    typeof v.savedAt === 'string'
  )
}

export function loadBookingDrafts(): BookingDraft[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isDraft)
      .slice(0, MAX_BOOKING_DRAFTS)
      .sort((a, b) => a.showDate.localeCompare(b.showDate))
  } catch {
    return []
  }
}

export function saveBookingDraft(draft: BookingDraft): BookingDraft[] {
  const current = loadBookingDrafts()
  const idx = current.findIndex((d) => d.id === draft.id)
  let updated: BookingDraft[]
  if (idx >= 0) {
    updated = current.map((d, i) => (i === idx ? draft : d))
  } else {
    // If at max, evict the oldest (already sorted by showDate, so drop last)
    const base = current.length >= MAX_BOOKING_DRAFTS ? current.slice(0, MAX_BOOKING_DRAFTS - 1) : current
    updated = [...base, draft]
  }
  updated = updated.sort((a, b) => a.showDate.localeCompare(b.showDate))
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Quota / privacy — silently drop.
    }
  }
  return updated
}

export function deleteBookingDraft(id: string): BookingDraft[] {
  const current = loadBookingDrafts()
  const updated = current.filter((d) => d.id !== id)
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Quota / privacy — silently drop.
    }
  }
  return updated
}

export function newDraftId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
