// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const REQUIRED_ENV = {
  SESSION_SECRET: 'test-secret',
  UCB_APP_PASSWORD: 'test-password',
}

describe('env validation', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    delete process.env.SKIP_ENV_VALIDATION
    delete process.env.npm_lifecycle_event
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('loads when all required server vars are set', async () => {
    Object.assign(process.env, REQUIRED_ENV)
    const { env } = await import('../../lib/env')
    expect(env.SESSION_SECRET).toBe('test-secret')
    expect(env.UCB_APP_PASSWORD).toBe('test-password')
  })

  it('throws when SESSION_SECRET is missing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    process.env.UCB_APP_PASSWORD = 'test-password'
    delete process.env.SESSION_SECRET
    await expect(import('../../lib/env')).rejects.toThrow(
      /Invalid environment variables/,
    )
  })

  it('throws when UCB_APP_PASSWORD is missing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    process.env.SESSION_SECRET = 'test-secret'
    delete process.env.UCB_APP_PASSWORD
    await expect(import('../../lib/env')).rejects.toThrow(
      /Invalid environment variables/,
    )
  })

  it('treats empty strings as undefined for optional vars', async () => {
    Object.assign(process.env, REQUIRED_ENV)
    process.env.GOOGLE_CLIENT_ID = ''
    const { env } = await import('../../lib/env')
    expect(env.GOOGLE_CLIENT_ID).toBeUndefined()
  })

  it('rejects invalid URL for GOOGLE_REDIRECT_URI', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    Object.assign(process.env, REQUIRED_ENV)
    process.env.GOOGLE_REDIRECT_URI = 'not-a-url'
    await expect(import('../../lib/env')).rejects.toThrow(
      /Invalid environment variables/,
    )
  })

  it('skips validation when SKIP_ENV_VALIDATION is set', async () => {
    process.env.SKIP_ENV_VALIDATION = '1'
    delete process.env.SESSION_SECRET
    delete process.env.UCB_APP_PASSWORD
    await expect(import('../../lib/env')).resolves.toBeDefined()
  })
})
