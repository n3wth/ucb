import { describe, it, expect } from 'vitest'
import { buildEventSummary } from '@/lib/calendar-event'
import type { ShowDetails } from '@/lib/types'

const base: ShowDetails = {
  showTitle: 'Maude Night',
  showDate: '2026-05-01',
  showTime: '20:00',
  venue: 'UCB Franklin',
  techRehearsalTime: '',
  presaleTicketPrice: 10,
  doorTicketPrice: 15,
  digitalTicket: { enabled: false, price: 0 },
  producerEmail: 'producer@example.com',
}

describe('buildEventSummary', () => {
  it('formats title with presale/door prices', () => {
    expect(buildEventSummary(base)).toBe('Maude Night ($10/$15)')
  })

  it('prefixes [LIVESTREAM] when digital ticket enabled', () => {
    const show: ShowDetails = {
      ...base,
      digitalTicket: { enabled: true, price: 5 },
    }
    expect(buildEventSummary(show)).toBe('[LIVESTREAM] Maude Night ($10/$15)')
  })

  it('preserves decimal prices', () => {
    const show: ShowDetails = {
      ...base,
      presaleTicketPrice: 12.5,
      doorTicketPrice: 17.99,
    }
    expect(buildEventSummary(show)).toBe('Maude Night ($12.50/$17.99)')
  })

  it('handles free shows', () => {
    const show: ShowDetails = {
      ...base,
      presaleTicketPrice: 0,
      doorTicketPrice: 0,
    }
    expect(buildEventSummary(show)).toBe('Maude Night ($0/$0)')
  })
})
