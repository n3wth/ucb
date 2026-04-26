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

  it('upsert reports persisted=false when no Supabase backend is configured', async () => {
    const result = await lineupLogStore.upsert(entry({ id: 'mem' }))
    expect(result.persisted).toBe(false)
    expect(result.entries.map((e) => e.id)).toEqual(['mem'])
  })

  it('remove drops the matching entry', async () => {
    await lineupLogStore.upsert(entry({ id: 'a' }))
    await lineupLogStore.upsert(entry({ id: 'b' }))
    const after = await lineupLogStore.remove('a')
    expect(after.entries.map((e) => e.id)).toEqual(['b'])
    expect(after.persisted).toBe(false)
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
    expect(result.entries).toHaveLength(1)
    expect(result.entries[0].id).toBe('a')
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
    expect(result.entries).toHaveLength(2)
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
    const ids = result.entries.map((e) => e.id).sort()
    expect(ids).toEqual(['existing', 'new-1'])
  })

  it('importMany reports persisted=false when writes only landed in memory', async () => {
    const result = await lineupLogStore.importMany([
      entry({ id: 'leg-1' }),
      entry({
        id: 'leg-2',
        showDate: '2026-06-01',
        performers: [{ performerId: 'p9', name: 'Zed' }],
      }),
    ])
    expect(result.persisted).toBe(false)
    expect(result.entries.map((e) => e.id).sort()).toEqual(['leg-1', 'leg-2'])
  })
})
