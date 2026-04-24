import { describe, it, expect, beforeEach } from 'vitest'
import {
  addPerformer,
  DEFAULT_PERFORMERS,
  dedupePerformers,
  groupByCategory,
  isValidEmail,
  loadPerformers,
  matchPerformersByName,
  newPerformerId,
  parseCastInput,
  removePerformer,
  savePerformers,
  updatePerformer,
} from '@/lib/asssscat-performers'
import type { AsssscatPerformer } from '@/lib/types'

const STORAGE_KEY = 'ucb.asssscat.performers'
const SEEDED_KEY = 'ucb.asssscat.performers.seeded'

beforeEach(() => {
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem(SEEDED_KEY)
})

const perf = (
  overrides: Partial<AsssscatPerformer> = {},
): AsssscatPerformer => ({
  id: overrides.id ?? newPerformerId(),
  name: overrides.name ?? 'Alice',
  email: overrides.email ?? 'alice@example.com',
  category: overrides.category ?? 'Core Cast',
})

describe('isValidEmail', () => {
  it('accepts well-formed emails', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
  })
  it('rejects empty and malformed', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('nope')).toBe(false)
  })
})

describe('dedupePerformers', () => {
  it('removes duplicates by lowercased email, first-seen wins', () => {
    const list = [
      perf({ id: '1', email: 'A@B.co' }),
      perf({ id: '2', email: 'a@b.co' }),
      perf({ id: '3', email: 'c@d.co' }),
    ]
    const out = dedupePerformers(list)
    expect(out).toHaveLength(2)
    expect(out[0].id).toBe('1')
    expect(out[1].id).toBe('3')
  })

  it('deduplicates no-email entries by lowercased name', () => {
    const list = [
      perf({ id: '1', name: 'Edi Patterson', email: '' }),
      perf({ id: '2', name: 'edi patterson', email: '' }),
      perf({ id: '3', name: 'Other Person', email: '' }),
    ]
    const out = dedupePerformers(list)
    expect(out).toHaveLength(2)
    expect(out[0].id).toBe('1')
    expect(out[1].id).toBe('3')
  })
})

describe('addPerformer / updatePerformer / removePerformer', () => {
  it('adds new performers', () => {
    const list = addPerformer([], {
      id: 'x',
      name: 'Alice',
      email: 'alice@example.com',
      category: 'Core Cast',
    })
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Alice')
  })

  it('accepts no-email performers (email: "")', () => {
    const list = addPerformer([], {
      id: 'y',
      name: 'Edi Patterson',
      email: '',
      category: 'Drop-Ins',
    })
    expect(list).toHaveLength(1)
    expect(list[0].email).toBe('')
  })

  it('updates existing performers by id', () => {
    const list = addPerformer([], {
      id: 'x',
      name: 'Alice',
      email: 'alice@example.com',
      category: 'Core Cast',
    })
    const updated = updatePerformer(list, 'x', { category: 'Subs' })
    expect(updated[0].category).toBe('Subs')
  })

  it('ignores updates that produce invalid records', () => {
    const list = addPerformer([], {
      id: 'x',
      name: 'Alice',
      email: 'alice@example.com',
      category: 'Core Cast',
    })
    const updated = updatePerformer(list, 'x', { email: 'not-an-email' })
    expect(updated[0].email).toBe('alice@example.com')
  })

  it('removes by id', () => {
    const list = [perf({ id: '1' }), perf({ id: '2', email: 'b@b.co' })]
    const out = removePerformer(list, '1')
    expect(out).toHaveLength(1)
    expect(out[0].id).toBe('2')
  })
})

describe('groupByCategory', () => {
  it('groups and alphabetizes within each category', () => {
    const list = [
      perf({ id: '1', name: 'Bob', email: 'b@x.co', category: 'Core Cast' }),
      perf({ id: '2', name: 'Alice', email: 'a@x.co', category: 'Core Cast' }),
      perf({ id: '3', name: 'Carol', email: 'c@x.co', category: 'Subs' }),
    ]
    const groups = groupByCategory(list)
    expect(groups['Core Cast'].map((p) => p.name)).toEqual(['Alice', 'Bob'])
    expect(groups['Subs'].map((p) => p.name)).toEqual(['Carol'])
    expect(groups['Wild Cards']).toEqual([])
  })
})

describe('parseCastInput', () => {
  it('splits on newlines', () => {
    expect(parseCastInput('Alice\nBob\nCarol')).toEqual(['Alice', 'Bob', 'Carol'])
  })
  it('splits on commas', () => {
    expect(parseCastInput('Alice, Bob, Carol')).toEqual(['Alice', 'Bob', 'Carol'])
  })
  it('trims whitespace and drops empty entries', () => {
    expect(parseCastInput('Alice\n\n  Bob  \n')).toEqual(['Alice', 'Bob'])
  })
  it('returns empty array for blank input', () => {
    expect(parseCastInput('')).toEqual([])
  })
})

describe('matchPerformersByName', () => {
  const performers = [
    perf({ id: '1', name: 'Alice Smith', email: 'alice@x.co' }),
    perf({ id: '2', name: 'Bob Jones', email: 'bob@x.co' }),
  ]

  it('matches exact names case-insensitively', () => {
    const results = matchPerformersByName(['alice smith', 'BOB JONES'], performers)
    expect(results[0].matched?.id).toBe('1')
    expect(results[1].matched?.id).toBe('2')
  })

  it('matches partial names', () => {
    const results = matchPerformersByName(['Alice'], performers)
    expect(results[0].matched?.id).toBe('1')
  })

  it('returns null for unmatched names', () => {
    const results = matchPerformersByName(['Zelda'], performers)
    expect(results[0].matched).toBeNull()
    expect(results[0].input).toBe('Zelda')
  })

  it('handles empty performers list', () => {
    const results = matchPerformersByName(['Alice'], [])
    expect(results[0].matched).toBeNull()
  })
})

describe('loadPerformers / savePerformers', () => {
  it('seeds default performers on first load (no storage)', () => {
    const result = loadPerformers()
    expect(result.length).toBe(DEFAULT_PERFORMERS.length)
    expect(result[0].name).toBe(DEFAULT_PERFORMERS[0].name)
  })

  it('marks storage as seeded after first load', () => {
    loadPerformers()
    expect(window.localStorage.getItem(SEEDED_KEY)).toBe('1')
  })

  it('does not re-seed after seeded flag is set', () => {
    window.localStorage.setItem(SEEDED_KEY, '1')
    expect(loadPerformers()).toEqual([])
  })

  it('merges defaults into pre-existing data when seeded flag is absent', () => {
    // Simulates Chris's case: he added one performer before the seed was deployed.
    const existing = [perf({ id: 'manual-1', name: 'Chris Renfro', email: 'christopher.a.renfro@gmail.com', category: 'Core Cast' })]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    // SEEDED_KEY is NOT set (beforeEach cleared it)
    const result = loadPerformers()
    // Should contain the full default roster, not just the one manual entry
    expect(result.length).toBeGreaterThan(1)
    expect(result.length).toBe(DEFAULT_PERFORMERS.length)
    // Chris Renfro appears exactly once (deduped by email)
    expect(result.filter((p) => p.email === 'christopher.a.renfro@gmail.com')).toHaveLength(1)
    // The seeded flag should now be set
    expect(window.localStorage.getItem(SEEDED_KEY)).toBe('1')
  })

  it('round-trips valid performers', () => {
    const list = [
      perf({ id: '1', name: 'Alice', email: 'a@x.co' }),
      perf({ id: '2', name: 'Bob', email: 'b@x.co' }),
    ]
    savePerformers(list)
    expect(loadPerformers()).toHaveLength(2)
  })

  it('drops invalid stored entries', () => {
    window.localStorage.setItem(SEEDED_KEY, '1')
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: '1', name: '', email: 'a@x.co', category: 'Core Cast' },
        { id: '2', name: 'Bob', email: 'bad', category: 'Core Cast' },
        { id: '3', name: 'Carol', email: 'c@x.co', category: 'Core Cast' },
        { id: '4', name: 'Edi Patterson', email: '', category: 'Drop-Ins' },
      ]),
    )
    // id:1 dropped (empty name), id:2 dropped (invalid email), id:3 and id:4 kept
    expect(loadPerformers()).toHaveLength(2)
  })

  it('ignores malformed stored JSON', () => {
    window.localStorage.setItem(SEEDED_KEY, '1')
    window.localStorage.setItem(STORAGE_KEY, '{nope')
    expect(loadPerformers()).toEqual([])
  })

  it('ignores non-array values', () => {
    window.localStorage.setItem(SEEDED_KEY, '1')
    window.localStorage.setItem(STORAGE_KEY, '"string"')
    expect(loadPerformers()).toEqual([])
  })
})
