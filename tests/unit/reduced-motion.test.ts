import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'

describe('prefers-reduced-motion', () => {
  it('globals.css disables animations and transitions when reduce is requested', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')

    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/)
    expect(css).toMatch(/animation-duration:\s*0\.01ms\s*!important/)
    expect(css).toMatch(/transition-duration:\s*0\.01ms\s*!important/)
    expect(css).toMatch(/scroll-behavior:\s*auto\s*!important/)
  })
})
