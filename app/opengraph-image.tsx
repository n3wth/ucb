import { SOCIAL_ALT, socialCard } from '@/lib/social-card'

export const alt = SOCIAL_ALT
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return socialCard(size)
}
