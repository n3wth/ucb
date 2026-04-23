import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ShowListApp } from '@/components/show-list-app'
import type { ShowListResponse } from '@/lib/types'

const now = new Date('2026-05-01T12:00:00Z')

const response: ShowListResponse = {
  shows: [
    {
      id: 'past-1',
      title: 'Past Show',
      startISO: '2026-04-10T20:00:00-04:00',
      venue: 'UCB Franklin',
      producer: 'past@example.com',
      link: 'https://calendar.example/past-1',
    },
    {
      id: 'future-1',
      title: 'Future Show',
      startISO: '2026-05-20T19:30:00-04:00',
      venue: 'UCB Annex',
      producer: 'future@example.com',
      link: 'https://calendar.example/future-1',
    },
  ],
}

describe('ShowListApp', () => {
  it('renders upcoming shows by default and switches filters', async () => {
    const fetchShows = vi.fn().mockResolvedValue(response)

    render(<ShowListApp fetchShows={fetchShows} now={now} />)

    await waitFor(() => {
      expect(screen.getByText('Future Show')).toBeInTheDocument()
    })
    expect(screen.queryByText('Past Show')).not.toBeInTheDocument()
    expect(fetchShows).toHaveBeenCalledTimes(1)

    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: /past/i }))

    expect(screen.getByText('Past Show')).toBeInTheDocument()
    expect(screen.queryByText('Future Show')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /all/i }))

    expect(screen.getByText('Past Show')).toBeInTheDocument()
    expect(screen.getByText('Future Show')).toBeInTheDocument()
  })

  it('renders an empty state when the calendar returns no shows', async () => {
    const fetchShows = vi.fn().mockResolvedValue({ shows: [] } as ShowListResponse)

    render(<ShowListApp fetchShows={fetchShows} now={now} />)

    await waitFor(() => {
      expect(screen.getByText(/no shows to display/i)).toBeInTheDocument()
    })
  })

  it('surfaces an error when the fetch fails', async () => {
    const fetchShows = vi.fn().mockRejectedValue(new Error('boom'))

    render(<ShowListApp fetchShows={fetchShows} now={now} />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('boom')
    })
  })
})
