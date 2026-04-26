import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_EMAIL_SETTINGS,
  loadEmailSettings,
  resetEmailSettings,
  saveEmailSettings,
} from '@/lib/asssscat-settings'

describe('asssscat-settings storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('returns defaults when nothing is stored', () => {
    const loaded = loadEmailSettings()
    expect(loaded).toEqual(DEFAULT_EMAIL_SETTINGS)
  })

  it('persists overrides and round-trips them', () => {
    saveEmailSettings({
      ...DEFAULT_EMAIL_SETTINGS,
      asssscatCallTime: '9:00PM',
      asssscatVenue: 'Test Venue',
    })
    const loaded = loadEmailSettings()
    expect(loaded.asssscatCallTime).toBe('9:00PM')
    expect(loaded.asssscatVenue).toBe('Test Venue')
    // Untouched fields stay at defaults.
    expect(loaded.asssscatArrivalTime).toBe(DEFAULT_EMAIL_SETTINGS.asssscatArrivalTime)
  })

  it('falls back to defaults for empty/whitespace strings', () => {
    saveEmailSettings({
      ...DEFAULT_EMAIL_SETTINGS,
      asssscatCallTime: '   ',
      asssscatVenue: '',
    })
    const loaded = loadEmailSettings()
    expect(loaded.asssscatCallTime).toBe(DEFAULT_EMAIL_SETTINGS.asssscatCallTime)
    expect(loaded.asssscatVenue).toBe(DEFAULT_EMAIL_SETTINGS.asssscatVenue)
  })

  it('ignores corrupt JSON and returns defaults', () => {
    window.localStorage.setItem('ucb.email-settings.v1', '{not-json')
    expect(loadEmailSettings()).toEqual(DEFAULT_EMAIL_SETTINGS)
  })

  it('reset clears stored settings', () => {
    saveEmailSettings({ ...DEFAULT_EMAIL_SETTINGS, asssscatCallTime: '9:00PM' })
    const cleared = resetEmailSettings()
    expect(cleared).toEqual(DEFAULT_EMAIL_SETTINGS)
    expect(loadEmailSettings()).toEqual(DEFAULT_EMAIL_SETTINGS)
  })
})
