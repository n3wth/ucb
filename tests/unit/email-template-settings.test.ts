import { describe, it, expect, beforeEach } from 'vitest'
import {
  ASSSSCAT_DEFAULTS,
  loadEmailTemplateSettings,
  resetEmailTemplateSettings,
  saveEmailTemplateSettings,
} from '@/lib/email-template-settings'
import { renderAsssscatBody } from '@/lib/emails'
import type { AsssscatShowDetails } from '@/lib/types'

const STORAGE_KEY = 'ucb.email-template-settings'

beforeEach(() => {
  window.localStorage.removeItem(STORAGE_KEY)
})

const baseDetails: AsssscatShowDetails = {
  showDate: '2026-05-03',
  improvisers: [],
  monologist: { name: '', link: '', credits: '' },
  ticketLink: '',
  oneTimeCc: [],
  defaultCc: [],
}

describe('loadEmailTemplateSettings', () => {
  it('returns defaults when nothing saved', () => {
    expect(loadEmailTemplateSettings().asssscat).toEqual(ASSSSCAT_DEFAULTS)
  })

  it('returns defaults when stored JSON is malformed', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json}')
    expect(loadEmailTemplateSettings().asssscat).toEqual(ASSSSCAT_DEFAULTS)
  })

  it('returns defaults when stored value is not an object', () => {
    window.localStorage.setItem(STORAGE_KEY, '"a string"')
    expect(loadEmailTemplateSettings().asssscat).toEqual(ASSSSCAT_DEFAULTS)
  })

  it('preserves defaults for missing or blank fields', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ asssscat: { contactPhone: '   ' } }),
    )
    expect(loadEmailTemplateSettings().asssscat).toEqual(ASSSSCAT_DEFAULTS)
  })
})

describe('saveEmailTemplateSettings', () => {
  it('round-trips override values', () => {
    saveEmailTemplateSettings({
      asssscat: {
        ...ASSSSCAT_DEFAULTS,
        contactPhone: '(555) 123-4567',
        callTime: '9:00PM',
      },
    })
    const loaded = loadEmailTemplateSettings()
    expect(loaded.asssscat.contactPhone).toBe('(555) 123-4567')
    expect(loaded.asssscat.callTime).toBe('9:00PM')
    expect(loaded.asssscat.compsEmail).toBe(ASSSSCAT_DEFAULTS.compsEmail)
  })
})

describe('resetEmailTemplateSettings', () => {
  it('clears stored overrides', () => {
    saveEmailTemplateSettings({
      asssscat: { ...ASSSSCAT_DEFAULTS, contactPhone: '(555) 999-0000' },
    })
    expect(loadEmailTemplateSettings().asssscat.contactPhone).toBe('(555) 999-0000')
    resetEmailTemplateSettings()
    expect(loadEmailTemplateSettings().asssscat).toEqual(ASSSSCAT_DEFAULTS)
  })
})

describe('renderAsssscatBody with overrides', () => {
  it('uses overridden contact phone, call time, arrival time, comps email', () => {
    const body = renderAsssscatBody({
      showDetails: baseDetails,
      overrides: {
        contactPhone: '(555) 123-4567',
        callTime: '9:00PM',
        arrivalTime: '8:45PM',
        compsEmail: 'comps@override.com',
      },
    })
    expect(body).toContain('(555) 123-4567')
    expect(body).toContain('9:00PM')
    expect(body).toContain('8:45PM')
    expect(body).toContain('comps@override.com')
    expect(body).not.toContain(ASSSSCAT_DEFAULTS.contactPhone)
  })

  it('falls back to defaults for blank overrides', () => {
    const body = renderAsssscatBody({
      showDetails: baseDetails,
      overrides: { contactPhone: '   ', callTime: '' },
    })
    expect(body).toContain(ASSSSCAT_DEFAULTS.contactPhone)
    expect(body).toContain(ASSSSCAT_DEFAULTS.callTime)
  })

  it('renders identically to default when no overrides supplied', () => {
    const a = renderAsssscatBody({ showDetails: baseDetails })
    const b = renderAsssscatBody({ showDetails: baseDetails, overrides: {} })
    expect(a).toEqual(b)
  })
})
