import { SOCIAL_ALT, socialCard } from '@/lib/social-card'

export const alt = SOCIAL_ALT
// Match opengraph-image (1200×630) for consistent previews on X and other platforms
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return socialCard(size)
}
