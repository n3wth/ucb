import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ToolsNav } from '@/components/tools-nav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/tools/show-confirmation',
}))

describe('ToolsNav', () => {
  it('renders links for each available tool and marks the active one', () => {
    render(<ToolsNav />)

    const confirmation = screen.getByRole('link', { name: /show confirmation/i })
    expect(confirmation).toHaveAttribute('href', '/tools/show-confirmation')
    expect(confirmation).toHaveAttribute('aria-current', 'page')

    const showList = screen.getByRole('link', { name: /show list/i })
    expect(showList).toHaveAttribute('href', '/tools/show-list')
    expect(showList).not.toHaveAttribute('aria-current')
  })

  it('labels the navigation landmark', () => {
    render(<ToolsNav />)
    expect(screen.getByRole('navigation', { name: /tools/i })).toBeInTheDocument()
  })
})
