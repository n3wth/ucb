import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ToolsError from '@/app/tools/error'

describe('ToolsError boundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a friendly message and a retry button that calls reset', async () => {
    const reset = vi.fn()
    const error = new Error('boom')

    render(<ToolsError error={error} reset={reset} />)

    expect(
      screen.getByRole('heading', { name: /something went wrong/i }),
    ).toBeInTheDocument()

    const retry = screen.getByRole('button', { name: /try again/i })
    await userEvent.click(retry)
    expect(reset).toHaveBeenCalledTimes(1)

    const back = screen.getByRole('link', { name: /back to tools/i })
    expect(back).toHaveAttribute('href', '/tools')
  })
})
