import { describe, it, expect } from 'vitest'
import { confirmShowRequestSchema } from '@/lib/schemas'

const validBody = {
  showTitle: 'Maude Night',
  showDate: '2026-05-01',
  showTime: '20:00',
  venue: 'UCB Franklin' as const,
  durationMinutes: 90,
  techRehearsalTime: '',
  presaleTicketPrice: 10,
  doorTicketPrice: 15,
  digitalTicket: { enabled: false, price: 0 },
  producerEmail: 'producer@example.com',
  emailSubject: 'Hi',
  emailBody: 'Body',
}

describe('confirmShowRequestSchema', () => {
  it('accepts a fully valid body', () => {
    const result = confirmShowRequestSchema.safeParse(validBody)
    expect(result.success).toBe(true)
  })

  it('accepts a body without optional email fields', () => {
    const { emailSubject, emailBody, ...rest } = validBody
    void emailSubject
    void emailBody
    const result = confirmShowRequestSchema.safeParse(rest)
    expect(result.success).toBe(true)
  })

  it.each([
    ['showTitle', 'showTitle is required'],
    ['showDate', 'showDate is required'],
    ['showTime', 'showTime is required'],
  ])('rejects missing %s', (field, expected) => {
    const body: Record<string, unknown> = { ...validBody, [field]: '' }
    const result = confirmShowRequestSchema.safeParse(body)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(expected)
    }
  })

  it('rejects an unsupported venue', () => {
    const result = confirmShowRequestSchema.safeParse({ ...validBody, venue: 'UCB Mothership' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('venue is required')
    }
  })

  it('rejects a malformed producerEmail', () => {
    const result = confirmShowRequestSchema.safeParse({ ...validBody, producerEmail: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('producerEmail is invalid')
    }
  })

  it('rejects an empty producerEmail', () => {
    const result = confirmShowRequestSchema.safeParse({ ...validBody, producerEmail: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('producerEmail is required')
    }
  })

  it('rejects non-numeric ticket prices', () => {
    const result = confirmShowRequestSchema.safeParse({
      ...validBody,
      presaleTicketPrice: 'free',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a malformed digitalTicket', () => {
    const result = confirmShowRequestSchema.safeParse({
      ...validBody,
      digitalTicket: { enabled: 'yes', price: 5 },
    })
    expect(result.success).toBe(false)
  })

  it.each([60, 90, 120, 75, 180])('accepts durationMinutes %s', (minutes) => {
    const result = confirmShowRequestSchema.safeParse({ ...validBody, durationMinutes: minutes })
    expect(result.success).toBe(true)
  })

  it('rejects a missing durationMinutes', () => {
    const { durationMinutes, ...rest } = validBody
    void durationMinutes
    const result = confirmShowRequestSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects a non-integer durationMinutes', () => {
    const result = confirmShowRequestSchema.safeParse({ ...validBody, durationMinutes: 90.5 })
    expect(result.success).toBe(false)
  })

  it('rejects durationMinutes below the minimum', () => {
    const result = confirmShowRequestSchema.safeParse({ ...validBody, durationMinutes: 5 })
    expect(result.success).toBe(false)
  })

  it('rejects durationMinutes above the maximum', () => {
    const result = confirmShowRequestSchema.safeParse({ ...validBody, durationMinutes: 10_000 })
    expect(result.success).toBe(false)
  })
})
