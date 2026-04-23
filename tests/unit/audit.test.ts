import { beforeEach, describe, expect, it } from 'vitest'
import { audit, redactEmail, AUDIT_MAX_ENTRIES } from '@/lib/audit'

describe('redactEmail', () => {
  it('keeps the domain and hides the local-part', () => {
    expect(redactEmail('producer@example.com')).toBe('*@example.com')
  })

  it('leaves non-email strings untouched', () => {
    expect(redactEmail('not-an-email')).toBe('not-an-email')
    expect(redactEmail('')).toBe('')
  })
})

describe('audit.log', () => {
  beforeEach(() => {
    audit._reset()
  })

  it('records an entry with id, timestamp, actor, action, targetId', () => {
    const entry = audit.log('staff', 'confirm-show', 'cal-123')
    expect(entry.id).toBeTruthy()
    expect(entry.actor).toBe('staff')
    expect(entry.action).toBe('confirm-show')
    expect(entry.targetId).toBe('cal-123')
    expect(Number.isNaN(Date.parse(entry.timestamp))).toBe(false)
  })

  it('falls back to "unknown" when actor is empty', () => {
    const entry = audit.log('', 'edit-show', 'cal-123')
    expect(entry.actor).toBe('unknown')
  })

  it('redacts email-looking strings in the payload', () => {
    const entry = audit.log('staff', 'confirm-show', 'cal-123', {
      producer: 'someone@producer.co',
      title: 'Big Show',
    })
    expect(entry.payload).toEqual({
      producer: '*@producer.co',
      title: 'Big Show',
    })
  })

  it('recurses into nested objects when redacting', () => {
    const entry = audit.log('staff', 'confirm-show', 'cal-123', {
      contact: { email: 'someone@producer.co', name: 'Someone' },
    })
    expect(entry.payload).toEqual({
      contact: { email: '*@producer.co', name: 'Someone' },
    })
  })

  it('lists entries newest-first and caps at the buffer size', () => {
    for (let i = 0; i < AUDIT_MAX_ENTRIES + 5; i++) {
      audit.log('staff', 'confirm-show', `cal-${i}`)
    }
    const list = audit.list()
    expect(list).toHaveLength(AUDIT_MAX_ENTRIES)
    expect(list[0]?.targetId).toBe(`cal-${AUDIT_MAX_ENTRIES + 4}`)
    expect(list[list.length - 1]?.targetId).toBe('cal-5')
  })

  it('respects the limit argument on list()', () => {
    for (let i = 0; i < 5; i++) audit.log('staff', 'confirm-show', `cal-${i}`)
    expect(audit.list(3)).toHaveLength(3)
  })
})
