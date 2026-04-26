import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SiteHeader } from '@/components/site-header'

describe('SiteHeader', () => {
  it('links logo and app name to home', () => {
    render(
      <SiteHeader
        toolName="Tools"
        authSlot={<span data-testid="auth">x</span>}
      />,
    )

    const home = screen.getByRole('link', { name: /ucb bookings — home/i })
    expect(home).toHaveAttribute('href', '/')
  })
})
