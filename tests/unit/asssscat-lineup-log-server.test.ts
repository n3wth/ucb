import { beforeEach, describe, expect, it } from 'vitest'
import { lineupLogStore } from '@/lib/asssscat-lineup-log-server'
import { newLineupId, type LineupEntry } from '@/lib/asssscat-lineup-log'

const entry = (overrides: Partial<LineupEntry> = {}): LineupEntry => ({
  id: overrides.id ?? newLineupId(),
  showDate: overrides.showDate ?? '2026-05-01',
  monologistName: overrides.monologistName ?? 'Sample Monologist',
  performers: overrides.performers ?? [
    { performerId: 'p1', name: 'Alex Fernie' },
  ],
  createdAt: overrides.createdAt ?? new Date().toISOString(),
})

beforeEach(() => {
  lineupLogStore._reset()
})

describe('lineupLogStore (in-memory fallback)', () => {
  it('starts empty', async () => {
    expect(await lineupLogStore.list()).toEqual([])
  })

  it('upserts new entries and returns them sorted most-recent-first', async () => {
    await lineupLogStore.upsert(entry({ id: 'a', showDate: '2026-01-01' }))
    await lineupLogStore.upsert(entry({ id: 'b', showDate: '2026-12-01' }))
    const list = await lineupLogStore.list()
    expect(list.map((e) => e.id)).toEqual(['b', 'a'])
  })

  it('upsert replaces an existing entry by id', async () => {
    await lineupLogStore.upsert(entry({ id: 'x', monologistName: 'Old' }))
    await lineupLogStore.upsert(entry({ id: 'x', monologistName: 'New' }))
    const list = await lineupLogStore.list()
    expect(list).toHaveLength(1)
    expect(list[0].monologistName).toBe('New')
  })

  it('remove drops the matching entry', async () => {
    await lineupLogStore.upsert(entry({ id: 'a' }))
    await lineupLogStore.upsert(entry({ id: 'b' }))
    const after = await lineupLogStore.remove('a')
    expect(after.map((e) => e.id)).toEqual(['b'])
  })

  it('recordIfNew skips duplicates by date + monologist + performer set', async () => {
    await lineupLogStore.recordIfNew(
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
    const result = await lineupLogStore.recordIfNew(
      entry({
        id: 'b',
        showDate: '2026-05-01',
        monologistName: 'Mono',
        performers: [
          { performerId: 'p2', name: 'Bob' },
          { performerId: 'p1', name: 'Alice' },
        ],
      }),
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('recordIfNew records when same date but different cast', async () => {
    await lineupLogStore.recordIfNew(
      entry({
        id: 'a',
        showDate: '2026-05-01',
        performers: [{ performerId: 'p1', name: 'Alice' }],
      }),
    )
    const result = await lineupLogStore.recordIfNew(
      entry({
        id: 'b',
        showDate: '2026-05-01',
        performers: [{ performerId: 'p2', name: 'Bob' }],
      }),
    )
    expect(result).toHaveLength(2)
  })

  it('importMany skips duplicates and entries with existing ids', async () => {
    await lineupLogStore.upsert(entry({ id: 'existing' }))
    const result = await lineupLogStore.importMany([
      entry({ id: 'existing', monologistName: 'Should be ignored' }),
      entry({
        id: 'new-1',
        showDate: '2026-06-01',
        performers: [{ performerId: 'p9', name: 'Zed' }],
      }),
    ])
    const ids = result.map((e) => e.id).sort()
    expect(ids).toEqual(['existing', 'new-1'])
  })
})
