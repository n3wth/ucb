import { describe, it, expect } from 'vitest'
import { sendAsssscatRequestSchema } from '@/lib/schemas'

const validBody = {
  showDate: '2026-05-03',
  improvisers: [
    { id: '1', name: 'Alice', email: 'alice@example.com', category: 'Core Cast' },
  ],
  monologist: { name: 'Jane', link: '', credits: '' },
  ticketLink: 'https://tickets.example.com/x',
  oneTimeCc: [],
  defaultCc: [],
}

describe('sendAsssscatRequestSchema', () => {
  it('accepts a minimal valid body', () => {
    const parsed = sendAsssscatRequestSchema.safeParse(validBody)
    expect(parsed.success).toBe(true)
  })

  it('requires at least one improviser', () => {
    const parsed = sendAsssscatRequestSchema.safeParse({
      ...validBody,
      improvisers: [],
    })
    expect(parsed.success).toBe(false)
  })

  it('accepts more than 8 improvisers', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      name: `P${i}`,
      email: `p${i}@example.com`,
      category: 'Core Cast' as const,
    }))
    const parsed = sendAsssscatRequestSchema.safeParse({
      ...validBody,
      improvisers: many,
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects unknown performer categories', () => {
    const parsed = sendAsssscatRequestSchema.safeParse({
      ...validBody,
      improvisers: [
        { id: '1', name: 'X', email: 'x@y.co', category: 'Nope' },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects invalid improviser emails', () => {
    const parsed = sendAsssscatRequestSchema.safeParse({
      ...validBody,
      improvisers: [
        { id: '1', name: 'X', email: 'not-an-email', category: 'Core Cast' },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects invalid CC entries', () => {
    const parsed = sendAsssscatRequestSchema.safeParse({
      ...validBody,
      oneTimeCc: ['bogus'],
    })
    expect(parsed.success).toBe(false)
  })

  it('caps default CC at 20 entries', () => {
    const many = Array.from({ length: 21 }, (_, i) => `cc${i}@example.com`)
    const parsed = sendAsssscatRequestSchema.safeParse({
      ...validBody,
      defaultCc: many,
    })
    expect(parsed.success).toBe(false)
  })
})
