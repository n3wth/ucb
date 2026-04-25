import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  loadLineupLog,
  saveLineupEntry,
  deleteLineupEntry,
  recordLineupIfNew,
  newLineupId,
  countLineupAppearancesById,
  lineupEntriesForPerformer,
  isDuplicateLineup,
  type LineupEntry,
} from '@/lib/asssscat-lineup-log'

const LEGACY_STORAGE_KEY = 'ucb.asssscat.lineup-log'
const LEGACY_MIGRATED_KEY = 'ucb.asssscat.lineup-log.migrated'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
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

// Minimal stub that records every fetch call and returns a JSON body.
function stubFetch(handler: (input: RequestInfo, init?: RequestInit) => unknown) {
  const calls: Array<{ input: RequestInfo; init?: RequestInit }> = []
  const fn = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
    calls.push({ input, init })
    const body = handler(input, init)
    return new Response(JSON.stringify(body ?? {}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fn)
  return { fn, calls }
}

describe('loadLineupLog', () => {
  it('returns server entries via the API', async () => {
    const a = entry({ id: 'a', showDate: '2026-01-01' })
    const b = entry({ id: 'b', showDate: '2026-12-01' })
    stubFetch(() => ({ entries: [a, b] }))

    const result = await loadLineupLog()
    expect(result.map((e) => e.id)).toEqual(['b', 'a'])
  })

  it('returns [] on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('boom', { status: 500 })))
    expect(await loadLineupLog()).toEqual([])
  })

  it('migrates legacy localStorage entries to the server on first load', async () => {
    const legacy = entry({ id: 'legacy-1' })
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify([legacy]))

    const { calls } = stubFetch((input) => {
      if (typeof input === 'string' && input.includes('/migrate')) {
        return { entries: [legacy], imported: 1 }
      }
      return { entries: [legacy] }
    })

    const result = await loadLineupLog()
    expect(result.map((e) => e.id)).toEqual(['legacy-1'])
    expect(calls.some((c) => String(c.input).includes('/migrate'))).toBe(true)
    expect(window.localStorage.getItem(LEGACY_MIGRATED_KEY)).toBe('1')
  })

  it('skips legacy migration once already migrated', async () => {
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify([entry({ id: 'x' })]))
    window.localStorage.setItem(LEGACY_MIGRATED_KEY, '1')

    const { calls } = stubFetch(() => ({ entries: [] }))
    await loadLineupLog()
    expect(calls.some((c) => String(c.input).includes('/migrate'))).toBe(false)
  })
})

describe('saveLineupEntry', () => {
  it('POSTs the entry and returns the server list', async () => {
    const e = entry({ id: '1' })
    const { calls } = stubFetch(() => ({ entries: [e] }))
    const result = await saveLineupEntry(e)
    expect(result).toEqual([e])
    expect(calls[0].init?.method).toBe('POST')
    expect(JSON.parse(String(calls[0].init?.body))).toMatchObject({ id: '1' })
  })

  it('returns [] on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })))
    expect(await saveLineupEntry(entry())).toEqual([])
  })
})

describe('deleteLineupEntry', () => {
  it('issues a DELETE request and returns the server list', async () => {
    const remaining = entry({ id: 'b' })
    const { calls } = stubFetch(() => ({ entries: [remaining] }))
    const result = await deleteLineupEntry('a')
    expect(result.map((e) => e.id)).toEqual(['b'])
    expect(calls[0].init?.method).toBe('DELETE')
    expect(String(calls[0].input)).toContain('/api/asssscat/lineup-log/a')
  })
})

describe('recordLineupIfNew', () => {
  it('POSTs with dedupe=true', async () => {
    const e = entry({ id: 'fresh' })
    const { calls } = stubFetch(() => ({ entries: [e] }))
    await recordLineupIfNew(e)
    const body = JSON.parse(String(calls[0].init?.body))
    expect(body.dedupe).toBe(true)
  })
})

describe('isDuplicateLineup', () => {
  it('detects duplicate by date + monologist + performer-name set', () => {
    const a = entry({
      id: 'a',
      showDate: '2026-05-01',
      monologistName: 'Mono',
      performers: [
        { performerId: 'p1', name: 'Alice' },
        { performerId: 'p2', name: 'Bob' },
      ],
    })
    const b = entry({
      id: 'b',
      showDate: '2026-05-01',
      monologistName: 'Mono',
      performers: [
        { performerId: 'p2', name: 'Bob' },
        { performerId: 'p1', name: 'Alice' },
      ],
    })
    expect(isDuplicateLineup(b, [a])).toBe(true)
  })

  it('does not flag entries with different casts', () => {
    const a = entry({
      id: 'a',
      showDate: '2026-05-01',
      performers: [{ performerId: 'p1', name: 'Alice' }],
    })
    const b = entry({
      id: 'b',
      showDate: '2026-05-01',
      performers: [{ performerId: 'p2', name: 'Bob' }],
    })
    expect(isDuplicateLineup(b, [a])).toBe(false)
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
