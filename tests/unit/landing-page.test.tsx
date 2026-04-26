import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LandingPage from '@/app/page'

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
}))

vi.mock('@/lib/session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/session')>('@/lib/session')
  return {
    ...actual,
    readSession: vi.fn(async () => null),
  }
})

vi.mock('@/components/header-auth', () => ({
  HeaderAuth: () => null,
}))

vi.mock('@/components/site-status-strip', () => ({
  SiteStatusStrip: () => null,
}))

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Bookings heading and a sign-in link when unauthed', async () => {
    const ui = await LandingPage()
    render(ui)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(/bookings/i)

    const signInLinks = screen.getAllByRole('link', { name: /continue/i })
    expect(signInLinks.length).toBeGreaterThan(0)
    expect(signInLinks[0]).toHaveAttribute('href', '/login')
  })

  it('renders an Open tools CTA when authed', async () => {
    const session = await import('@/lib/session')
    vi.mocked(session.readSession).mockResolvedValueOnce({ email: 'oliver@ucbcomedy.com' })

    const ui = await LandingPage()
    render(ui)

    const ctas = screen.getAllByRole('link', { name: /open tools/i })
    expect(ctas.length).toBeGreaterThan(0)
    expect(ctas[0]).toHaveAttribute('href', '/tools')
  })
})
