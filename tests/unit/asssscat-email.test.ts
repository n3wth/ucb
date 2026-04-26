import { describe, it, expect } from 'vitest'
import {
  ASSSSCAT_CONTACT_PHONE,
  ASSSSCAT_COMPS_EMAIL,
  ASSSSCAT_VENUE,
  renderAsssscatBody,
  renderAsssscatSubject,
} from '@/lib/emails'
import type { AsssscatShowDetails } from '@/lib/types'

const baseDetails: AsssscatShowDetails = {
  showDate: '2026-05-03',
  improvisers: [
    { id: '1', name: 'Alice', email: 'alice@example.com', category: 'Core Cast' },
    { id: '2', name: 'Bob', email: 'bob@example.com', category: 'Core Cast' },
    { id: '3', name: 'Carol', email: 'carol@example.com', category: 'Wild Cards' },
    { id: '4', name: 'Dave', email: 'dave@example.com', category: 'Subs' },
    { id: '5', name: 'Eve', email: 'eve@example.com', category: 'Drop-Ins' },
    { id: '6', name: 'Frank', email: 'frank@example.com', category: 'Test Group' },
  ],
  monologist: {
    name: 'Jane Doe',
    link: 'https://example.com/jane',
    credits: 'SNL, Hacks',
  },
  ticketLink: 'https://tickets.example.com/asssscat',
  oneTimeCc: [],
  defaultCc: [],
}

describe('renderAsssscatSubject', () => {
  it('includes the formatted show date', () => {
    const subject = renderAsssscatSubject(baseDetails)
    expect(subject).toContain('ASSSSCAT cast booking')
    expect(subject).toContain('May 3, 2026')
  })

  it('falls back to TBD when show date is missing', () => {
    const subject = renderAsssscatSubject({ ...baseDetails, showDate: '' })
    expect(subject).toContain('TBD')
  })
})

describe('renderAsssscatBody', () => {
  const body = renderAsssscatBody({ showDetails: baseDetails })

  it('includes all 8 cast slots, filling missing ones as blank', () => {
    expect(body).toContain('1. Alice')
    expect(body).toContain('6. Frank')
    expect(body).toMatch(/7\.\s*\n/)
    expect(body).toMatch(/8\.\s*\n/)
  })

  it('includes monologist name, link, and credits', () => {
    expect(body).toContain('Jane Doe (https://example.com/jane) — SNL, Hacks')
  })

  it('includes ticket link and comps instructions', () => {
    expect(body).toContain('https://tickets.example.com/asssscat')
    expect(body).toContain(ASSSSCAT_COMPS_EMAIL)
  })

  it('opens with correct greeting', () => {
    expect(body).toMatch(/^Hello everybody--/)
  })

  it('includes venue and contact phone, no closing signature', () => {
    expect(body).toContain(ASSSSCAT_VENUE)
    expect(body).toContain(ASSSSCAT_CONTACT_PHONE)
    expect(body).not.toContain('Chris Renfro')
  })

  it('renders call time and arrival time', () => {
    expect(body).toContain('8:30PM')
    expect(body).toContain('8:15PM')
  })

  it('uses TBD when ticket link is missing', () => {
    const empty = renderAsssscatBody({
      showDetails: { ...baseDetails, ticketLink: '' },
    })
    expect(empty).toMatch(/TICKET LINK\nTBD/)
  })

  it('monologist without link omits parentheses', () => {
    const noLink = renderAsssscatBody({
      showDetails: {
        ...baseDetails,
        monologist: { name: 'No Link', link: '', credits: 'Credits' },
      },
    })
    expect(noLink).toContain('No Link — Credits')
    expect(noLink).not.toContain('No Link ()')
  })

  it('monologist falls back to TBD when name missing', () => {
    const noMono = renderAsssscatBody({
      showDetails: {
        ...baseDetails,
        monologist: { name: '', link: '', credits: '' },
      },
    })
    expect(noMono).toMatch(/MONOLOGIST\nTBD/)
  })

  it('applies overrides for call time, arrival, contact phone, comps email, and venue', () => {
    const overridden = renderAsssscatBody({
      showDetails: baseDetails,
      overrides: {
        callTime: '9:00PM',
        arrivalTime: '8:45PM',
        contactPhone: '(555) 123-4567',
        compsEmail: 'comps@example.com',
        venue: 'Custom Venue, 1 Test St',
      },
    })
    expect(overridden).toContain('9:00PM')
    expect(overridden).toContain('8:45PM')
    expect(overridden).toContain('(555) 123-4567')
    expect(overridden).toContain('comps@example.com')
    expect(overridden).toContain('Custom Venue, 1 Test St')
    // Defaults should not leak through when overrides are provided.
    expect(overridden).not.toContain('8:30PM')
    expect(overridden).not.toContain('8:15PM')
  })

  it('appends signature when override is non-empty, omits when blank', () => {
    const withSig = renderAsssscatBody({
      showDetails: baseDetails,
      overrides: { signature: 'Chris Renfro, Artistic Director' },
    })
    expect(withSig).toContain('Chris Renfro, Artistic Director')

    const noSig = renderAsssscatBody({
      showDetails: baseDetails,
      overrides: { signature: '   ' },
    })
    expect(noSig).not.toContain('Chris Renfro')
  })

  it('falls back to defaults when override values are empty strings', () => {
    const body = renderAsssscatBody({
      showDetails: baseDetails,
      overrides: { callTime: '', venue: '   ' },
    })
    expect(body).toContain('8:30PM')
    expect(body).toContain(ASSSSCAT_VENUE)
  })
})
