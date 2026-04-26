// Full UCB wordmark (same as /public/ucb.svg in the app header) as a data URL for
// next/og (Satori) and icon routes. Replaces `fill="black"` so the mark reads on dark tiles.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const UCB_BRAND = {
  dark: '#2b2c30',
  light: '#f5f3ea',
  accent: '#f5c518',
} as const

const dataUrlByFill = new Map<string, string>()

export function ucbWordmarkDataUrl(foreground: string = UCB_BRAND.light) {
  const hit = dataUrlByFill.get(foreground)
  if (hit) return hit

  const path = join(process.cwd(), 'public', 'ucb.svg')
  const wordmark = readFileSync(path, 'utf-8')
  const tinted = wordmark.replaceAll('fill="black"', `fill="${foreground}"`)
  const url = `data:image/svg+xml;utf8,${encodeURIComponent(tinted)}`
  dataUrlByFill.set(foreground, url)
  return url
}
