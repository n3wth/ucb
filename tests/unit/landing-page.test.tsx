import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LandingPage from '@/app/page'

describe('LandingPage', () => {
  it('renders the hero heading and a sign-in link', () => {
    render(<LandingPage />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(/internal tools for the ucb/i)
    expect(heading).toHaveTextContent(/artistic team/i)

    const signInLinks = screen.getAllByRole('link', { name: /sign in/i })
    expect(signInLinks.length).toBeGreaterThan(0)
    expect(signInLinks[0]).toHaveAttribute('href', '/login')
  })
})
