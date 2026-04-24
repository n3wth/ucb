import { describe, it, expect } from 'vitest'
import {
  DRIVE_FOLDER_PLACEHOLDER,
  injectDriveFolderUrl,
  renderShowConfirmationBody,
} from '@/lib/emails'
import type { ShowDetails } from '@/lib/types'

const showDetails: ShowDetails = {
  showTitle: 'Maude Night',
  showDate: '2026-05-01',
  showTime: '20:00',
  venue: 'UCB Franklin',
  durationMinutes: 90,
  techRehearsalTime: '',
  techRehearsalDurationMinutes: 90,
  presaleTicketPrice: 10,
  doorTicketPrice: 15,
  digitalTicket: { enabled: false, price: 0 },
  producerEmail: 'producer@example.com',
  ccEmails: [],
}

const DRIVE_URL = 'https://drive.google.com/drive/folders/abc123'

describe('renderShowConfirmationBody', () => {
  it('renders the placeholder when no drive URL is provided', () => {
    const body = renderShowConfirmationBody({ showDetails })
    expect(body).toContain(DRIVE_FOLDER_PLACEHOLDER)
    expect(body).not.toContain(DRIVE_URL)
  })

  it('renders the drive URL line when provided', () => {
    const body = renderShowConfirmationBody({ showDetails, driveFolderUrl: DRIVE_URL })
    expect(body).toContain(`Your show folder: ${DRIVE_URL}`)
    expect(body).not.toContain(DRIVE_FOLDER_PLACEHOLDER)
  })

  it('places SHOW FOLDER above SHOW DETAILS and TICKET PRICING', () => {
    const body = renderShowConfirmationBody({ showDetails, driveFolderUrl: DRIVE_URL })
    const folderIdx = body.indexOf('SHOW FOLDER')
    const detailsIdx = body.indexOf('SHOW DETAILS')
    const pricingIdx = body.indexOf('TICKET PRICING')
    expect(folderIdx).toBeGreaterThan(-1)
    expect(folderIdx).toBeLessThan(detailsIdx)
    expect(folderIdx).toBeLessThan(pricingIdx)
  })
})

describe('injectDriveFolderUrl', () => {
  it('replaces the placeholder with the real folder URL', () => {
    const original = renderShowConfirmationBody({ showDetails })
    const injected = injectDriveFolderUrl(original, DRIVE_URL)
    expect(injected).toContain(`Your show folder: ${DRIVE_URL}`)
    expect(injected).not.toContain(DRIVE_FOLDER_PLACEHOLDER)
  })

  it('preserves user edits outside the placeholder', () => {
    const original = renderShowConfirmationBody({ showDetails })
    const edited = original.replace('Hi there,', 'Hello friend,')
    const injected = injectDriveFolderUrl(edited, DRIVE_URL)
    expect(injected).toContain('Hello friend,')
    expect(injected).toContain(`Your show folder: ${DRIVE_URL}`)
  })

  it('appends a SHOW FOLDER block when the placeholder has been removed', () => {
    const stripped = 'Custom body with no folder section.'
    const injected = injectDriveFolderUrl(stripped, DRIVE_URL)
    expect(injected).toContain('SHOW FOLDER')
    expect(injected).toContain(`Your show folder: ${DRIVE_URL}`)
  })

  it('is idempotent when the URL is already present', () => {
    const withUrl = renderShowConfirmationBody({ showDetails, driveFolderUrl: DRIVE_URL })
    const injected = injectDriveFolderUrl(withUrl, DRIVE_URL)
    expect(injected).toBe(withUrl)
  })
})
