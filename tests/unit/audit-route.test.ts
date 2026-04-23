import { beforeEach, describe, expect, it } from 'vitest'
import { audit } from '@/lib/audit'
import { GET } from '@/app/api/audit/route'

describe('GET /api/audit', () => {
  beforeEach(() => {
    audit._reset()
  })

  it('returns an empty entries array when no actions have been logged', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ entries: [] })
  })

  it('returns logged entries newest-first', async () => {
    audit.log('staff', 'confirm-show', 'cal-a')
    audit.log('staff', 'confirm-show', 'cal-b')
    const res = await GET()
    const body = await res.json()
    expect(body.entries.map((e: { targetId: string }) => e.targetId)).toEqual([
      'cal-b',
      'cal-a',
    ])
  })
})
