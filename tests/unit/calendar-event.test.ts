import { describe, it, expect } from 'vitest'
import { buildCalendarEventSummary } from '@/lib/calendar-event'

describe('buildCalendarEventSummary', () => {
  it('formats title with presale and door prices', () => {
    const summary = buildCalendarEventSummary({
      showTitle: 'Maude Night',
      presaleTicketPrice: 10,
      doorTicketPrice: 15,
      digitalTicket: { enabled: false, price: 0 },
    })
    expect(summary).toBe('Maude Night ($10.00/$15.00)')
  })

  it('adds [LIVESTREAM] prefix when digital ticket is enabled', () => {
    const summary = buildCalendarEventSummary({
      showTitle: 'Maude Night',
      presaleTicketPrice: 10,
      doorTicketPrice: 15,
      digitalTicket: { enabled: true, price: 8 },
    })
    expect(summary).toBe('[LIVESTREAM] Maude Night ($10.00/$15.00)')
  })

  it('does not add [LIVESTREAM] prefix when digital ticket is disabled', () => {
    const summary = buildCalendarEventSummary({
      showTitle: 'Friday Night Show',
      presaleTicketPrice: 5,
      doorTicketPrice: 10,
      digitalTicket: { enabled: false, price: 0 },
    })
    expect(summary).not.toContain('[LIVESTREAM]')
  })

  it('handles equal presale and door prices', () => {
    const summary = buildCalendarEventSummary({
      showTitle: 'Harold Night',
      presaleTicketPrice: 12,
      doorTicketPrice: 12,
      digitalTicket: { enabled: false, price: 0 },
    })
    expect(summary).toBe('Harold Night ($12.00/$12.00)')
  })

  it('handles decimal prices', () => {
    const summary = buildCalendarEventSummary({
      showTitle: 'Special Show',
      presaleTicketPrice: 7.5,
      doorTicketPrice: 12.5,
      digitalTicket: { enabled: false, price: 0 },
    })
    expect(summary).toBe('Special Show ($7.50/$12.50)')
  })
})
