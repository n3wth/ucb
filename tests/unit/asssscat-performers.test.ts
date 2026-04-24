import { describe, it, expect, beforeEach } from 'vitest'
import {
  addPerformer,
  dedupePerformers,
  groupByCategory,
  isValidEmail,
  loadPerformers,
  newPerformerId,
  removePerformer,
  savePerformers,
  updatePerformer,
} from '@/lib/asssscat-performers'
import type { AsssscatPerformer } from '@/lib/types'

const STORAGE_KEY = 'ucb.asssscat.performers'

beforeEach(() => {
  window.localStorage.removeItem(STORAGE_KEY)
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

describe('loadPerformers / savePerformers', () => {
  it('returns [] when nothing is saved', () => {
    expect(loadPerformers()).toEqual([])
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
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: '1', name: '', email: 'a@x.co', category: 'Core Cast' },
        { id: '2', name: 'Bob', email: 'bad', category: 'Core Cast' },
        { id: '3', name: 'Carol', email: 'c@x.co', category: 'Core Cast' },
      ]),
    )
    expect(loadPerformers()).toHaveLength(1)
  })

  it('ignores malformed stored JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{nope')
    expect(loadPerformers()).toEqual([])
  })

  it('ignores non-array values', () => {
    window.localStorage.setItem(STORAGE_KEY, '"string"')
    expect(loadPerformers()).toEqual([])
  })
})
