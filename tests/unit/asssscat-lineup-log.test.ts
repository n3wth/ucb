import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadLineupLog,
  saveLineupEntry,
  deleteLineupEntry,
  recordLineupIfNew,
  newLineupId,
  countLineupAppearancesById,
  lineupEntriesForPerformer,
  type LineupEntry,
} from '@/lib/asssscat-lineup-log'

const STORAGE_KEY = 'ucb.asssscat.lineup-log'

beforeEach(() => {
  window.localStorage.removeItem(STORAGE_KEY)
})

const entry = (overrides: Partial<LineupEntry> = {}): LineupEntry => ({
  id: overrides.id ?? newLineupId(),
  showDate: overrides.showDate ?? '2026-05-01',
  monologistName: overrides.monologistName ?? 'Sample Monologist',
  performers: overrides.performers ?? [
    { performerId: 'p1', name: 'Alex Fernie' },
    { performerId: null, name: 'Unknown Person' },
  ],
  createdAt: overrides.createdAt ?? new Date().toISOString(),
})

describe('loadLineupLog', () => {
  it('returns empty list when storage is empty', () => {
    expect(loadLineupLog()).toEqual([])
  })

  it('ignores corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json')
    expect(loadLineupLog()).toEqual([])
  })

  it('filters out non-entries', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ bogus: true }, entry({ id: 'a' })]),
    )
    const loaded = loadLineupLog()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe('a')
  })
})

describe('saveLineupEntry', () => {
  it('inserts new entries', () => {
    const e = entry({ id: '1' })
    const result = saveLineupEntry(e)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
    expect(loadLineupLog()).toEqual(result)
  })

  it('replaces existing entry by id', () => {
    saveLineupEntry(entry({ id: '1', monologistName: 'Old' }))
    const updated = saveLineupEntry(entry({ id: '1', monologistName: 'New' }))
    expect(updated).toHaveLength(1)
    expect(updated[0].monologistName).toBe('New')
  })

  it('sorts results most-recent-date first', () => {
    saveLineupEntry(entry({ id: 'a', showDate: '2026-01-01' }))
    saveLineupEntry(entry({ id: 'b', showDate: '2026-12-01' }))
    saveLineupEntry(entry({ id: 'c', showDate: '2026-06-01' }))
    const dates = loadLineupLog().map((e) => e.showDate)
    expect(dates).toEqual(['2026-12-01', '2026-06-01', '2026-01-01'])
  })
})

describe('deleteLineupEntry', () => {
  it('removes the matching entry', () => {
    saveLineupEntry(entry({ id: 'a' }))
    saveLineupEntry(entry({ id: 'b' }))
    const remaining = deleteLineupEntry('a')
    expect(remaining.map((e) => e.id)).toEqual(['b'])
  })
})

describe('recordLineupIfNew', () => {
  it('records when no matching entry exists', () => {
    const result = recordLineupIfNew(entry({ id: 'fresh' }))
    expect(result).toHaveLength(1)
  })

  it('skips a duplicate (same date + monologist + performer set)', () => {
    recordLineupIfNew(
      entry({
        id: 'a',
        showDate: '2026-05-01',
        monologistName: 'Mono',
        performers: [
          { performerId: 'p1', name: 'Alice' },
          { performerId: 'p2', name: 'Bob' },
        ],
      }),
    )
    const result = recordLineupIfNew(
      entry({
        id: 'b',
        showDate: '2026-05-01',
        monologistName: 'Mono',
        // Same names in different order — still a duplicate.
        performers: [
          { performerId: 'p2', name: 'Bob' },
          { performerId: 'p1', name: 'Alice' },
        ],
      }),
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('records when same date but different cast', () => {
    recordLineupIfNew(
      entry({
        id: 'a',
        showDate: '2026-05-01',
        performers: [{ performerId: 'p1', name: 'Alice' }],
      }),
    )
    const result = recordLineupIfNew(
      entry({
        id: 'b',
        showDate: '2026-05-01',
        performers: [{ performerId: 'p2', name: 'Bob' }],
      }),
    )
    expect(result).toHaveLength(2)
  })
})

describe('countLineupAppearancesById', () => {
  it('returns empty map for no entries', () => {
    expect(countLineupAppearancesById([])).toEqual(new Map())
  })

  it('counts appearances per linked performer id', () => {
    const entries: LineupEntry[] = [
      entry({
        id: 'a',
        showDate: '2026-01-01',
        performers: [
          { performerId: 'p1', name: 'Alice' },
          { performerId: 'p2', name: 'Bob' },
        ],
      }),
      entry({
        id: 'b',
        showDate: '2026-02-01',
        performers: [
          { performerId: 'p1', name: 'Alice' },
          { performerId: 'p3', name: 'Carol' },
        ],
      }),
    ]
    const counts = countLineupAppearancesById(entries)
    expect(counts.get('p1')).toBe(2)
    expect(counts.get('p2')).toBe(1)
    expect(counts.get('p3')).toBe(1)
  })

  it('skips performers without a linked id', () => {
    const entries: LineupEntry[] = [
      entry({
        id: 'a',
        performers: [
          { performerId: 'p1', name: 'Alice' },
          { performerId: null, name: 'Unlinked Person' },
        ],
      }),
    ]
    const counts = countLineupAppearancesById(entries)
    expect(counts.get('p1')).toBe(1)
    expect(counts.size).toBe(1)
  })
})

describe('lineupEntriesForPerformer', () => {
  it('returns only entries that include the given performer id', () => {
    const entries: LineupEntry[] = [
      entry({ id: 'a', performers: [{ performerId: 'p1', name: 'Alice' }] }),
      entry({ id: 'b', performers: [{ performerId: 'p2', name: 'Bob' }] }),
      entry({
        id: 'c',
        performers: [
          { performerId: 'p1', name: 'Alice' },
          { performerId: 'p2', name: 'Bob' },
        ],
      }),
    ]
    const result = lineupEntriesForPerformer(entries, 'p1')
    expect(result.map((e) => e.id).sort()).toEqual(['a', 'c'])
  })

})
