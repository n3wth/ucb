import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'

describe('sitemap', () => {
  it('includes the public routes with absolute URLs', () => {
    const entries = sitemap()
    const urls = entries.map((e) => e.url)

    expect(urls).toContain('https://ucb-bookings.vercel.app')
    expect(urls).toContain('https://ucb-bookings.vercel.app/login')
    for (const url of urls) {
      expect(url.startsWith('http')).toBe(true)
    }
  })

  it('does not include protected routes', () => {
    const urls = sitemap().map((e) => e.url)
    expect(urls.some((u) => u.includes('/tools'))).toBe(false)
    expect(urls.some((u) => u.includes('/api'))).toBe(false)
  })
})
