import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/version/route'

describe('GET /api/version', () => {
  it('returns sha and buildTime', async () => {
    const res = await GET()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(typeof body.sha).toBe('string')
    expect(body.sha.length).toBeGreaterThan(0)
    expect(typeof body.buildTime).toBe('string')
    expect(Number.isNaN(Date.parse(body.buildTime))).toBe(false)
  })
})
