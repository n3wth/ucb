import { describe, it, expect, beforeEach } from 'vitest'
import {
  dedupeEmails,
  isValidEmail,
  loadDefaultCcEmails,
  saveDefaultCcEmails,
  MAX_DEFAULT_CC,
} from '@/lib/cc-preferences'

const STORAGE_KEY = 'ucb.show-confirmation.default-cc'

// Reset the single key we own between tests. Avoid .clear() — vitest 4's
// built-in localStorage doesn't implement it on all harness versions.
beforeEach(() => {
  window.localStorage.removeItem(STORAGE_KEY)
})

describe('isValidEmail', () => {
  it.each([
    ['a@b.co', true],
    ['user+tag@example.com', true],
    ['', false],
    ['no-at-sign', false],
    ['missing-dot@local', false],
  ])('validates %s -> %s', (input, expected) => {
    expect(isValidEmail(input)).toBe(expected)
  })
})

describe('dedupeEmails', () => {
  it('drops blanks and duplicates case-insensitively, preserving first-seen casing', () => {
    const out = dedupeEmails(['  a@b.co ', 'A@B.co', '', 'c@d.co', 'c@d.co'])
    expect(out).toEqual(['a@b.co', 'c@d.co'])
  })
})

describe('loadDefaultCcEmails / saveDefaultCcEmails', () => {
  it('returns [] when nothing saved', () => {
    expect(loadDefaultCcEmails()).toEqual([])
  })

  it('round-trips valid emails', () => {
    const saved = saveDefaultCcEmails(['one@example.com', 'two@example.com'])
    expect(saved).toEqual(['one@example.com', 'two@example.com'])
    expect(loadDefaultCcEmails()).toEqual(['one@example.com', 'two@example.com'])
  })

  it('drops invalid entries on save', () => {
    const saved = saveDefaultCcEmails(['ok@example.com', 'bogus', ''])
    expect(saved).toEqual(['ok@example.com'])
    expect(loadDefaultCcEmails()).toEqual(['ok@example.com'])
  })

  it('caps saved list at MAX_DEFAULT_CC', () => {
    const many = Array.from({ length: MAX_DEFAULT_CC + 5 }, (_, i) => `cc${i}@example.com`)
    const saved = saveDefaultCcEmails(many)
    expect(saved).toHaveLength(MAX_DEFAULT_CC)
    expect(loadDefaultCcEmails()).toHaveLength(MAX_DEFAULT_CC)
  })

  it('ignores malformed stored JSON', () => {
    window.localStorage.setItem('ucb.show-confirmation.default-cc', '{not json}')
    expect(loadDefaultCcEmails()).toEqual([])
  })

  it('ignores non-array stored values', () => {
    window.localStorage.setItem('ucb.show-confirmation.default-cc', '"just a string"')
    expect(loadDefaultCcEmails()).toEqual([])
  })
})
