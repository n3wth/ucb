import { describe, it, expect } from 'vitest'
import { computeStartEnd } from '@/lib/show-time'

describe('computeStartEnd', () => {
  it('adds the requested duration to the show start time', () => {
    const { startISO, endISO } = computeStartEnd({
      showDate: '2026-05-01',
      showTime: '20:00',
      durationMinutes: 90,
    })
    expect(startISO).toBe('2026-05-01T20:00:00')
    expect(endISO).toBe('2026-05-01T21:30:00')
  })

  it('handles a 60 minute duration', () => {
    const { endISO } = computeStartEnd({
      showDate: '2026-05-01',
      showTime: '19:00',
      durationMinutes: 60,
    })
    expect(endISO).toBe('2026-05-01T20:00:00')
  })

  it('handles a 120 minute duration', () => {
    const { endISO } = computeStartEnd({
      showDate: '2026-05-01',
      showTime: '19:00',
      durationMinutes: 120,
    })
    expect(endISO).toBe('2026-05-01T21:00:00')
  })

  it('handles a custom duration that crosses midnight', () => {
    const { endISO } = computeStartEnd({
      showDate: '2026-05-01',
      showTime: '23:30',
      durationMinutes: 90,
    })
    expect(endISO).toBe('2026-05-02T01:00:00')
  })
})
