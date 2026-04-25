// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest'

type Mod = typeof import('../../lib/google-signin')
let mod: Mod

beforeAll(async () => {
  process.env.SESSION_SECRET ||= 'test-secret'
  process.env.UCB_APP_PASSWORD ||= 'test-password'
  mod = await import('../../lib/google-signin')
})

describe('isAllowedEmail', () => {
  it('accepts emails on the allowed domain', () => {
    expect(mod.isAllowedEmail('chris@ucbcomedy.com')).toBe(true)
    expect(mod.isAllowedEmail('first.last@ucbcomedy.com')).toBe(true)
  })

  it('is case-insensitive on the domain', () => {
    expect(mod.isAllowedEmail('Chris@UCBCOMEDY.com')).toBe(true)
    expect(mod.isAllowedEmail('chris@UcbComedy.Com')).toBe(true)
  })

  it('rejects emails on other domains', () => {
    expect(mod.isAllowedEmail('chris@gmail.com')).toBe(false)
    expect(mod.isAllowedEmail('chris@ucb.com')).toBe(false)
    expect(mod.isAllowedEmail('chris@notucbcomedy.com')).toBe(false)
  })

  it('rejects subdomain spoofing attempts', () => {
    expect(mod.isAllowedEmail('chris@evil.ucbcomedy.com.attacker.com')).toBe(false)
    expect(mod.isAllowedEmail('chris@sub.ucbcomedy.com')).toBe(false)
  })

  it('rejects malformed emails', () => {
    expect(mod.isAllowedEmail('')).toBe(false)
    expect(mod.isAllowedEmail('no-at-sign')).toBe(false)
    expect(mod.isAllowedEmail('@ucbcomedy.com')).toBe(false)
    expect(mod.isAllowedEmail('chris@')).toBe(false)
  })

  it('honors a custom allowed domain', () => {
    expect(mod.isAllowedEmail('alex@example.org', 'example.org')).toBe(true)
    expect(mod.isAllowedEmail('alex@ucbcomedy.com', 'example.org')).toBe(false)
  })

  it('exposes the default allowed domain constant', () => {
    expect(mod.DEFAULT_ALLOWED_DOMAIN).toBe('ucbcomedy.com')
  })
})
