import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UCB Bookings',
    short_name: 'UCB Bookings',
    description: 'Staff tools for confirming shows.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a0a0c',
    theme_color: '#1a0a0c',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/icon', type: 'image/png', sizes: '32x32' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  }
}
