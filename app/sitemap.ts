import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? 'https://ucb-bookings.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteUrl}/login`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
