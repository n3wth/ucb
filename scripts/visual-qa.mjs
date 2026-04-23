import { chromium } from '@playwright/test'

const BASE = 'http://localhost:3000'
const OUT = '/tmp/visual-qa-ucb-2ub'

const routes = [
  { name: 'root', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'tools', path: '/tools' },
  { name: 'tools-show-confirmation', path: '/tools/show-confirmation' },
]

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
]

const results = []

const browser = await chromium.launch()
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()

  const consoleMsgs = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMsgs.push({ type: msg.type(), text: msg.text() })
    }
  })
  page.on('pageerror', (err) => {
    consoleMsgs.push({ type: 'pageerror', text: err.message })
  })

  for (const r of routes) {
    const url = BASE + r.path
    const entry = { viewport: vp.name, route: r.path, url, console: [] }
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      entry.status = resp ? resp.status() : 'no-resp'
      await page.waitForTimeout(500)
      const file = `${OUT}/${r.name}-${vp.name}.png`
      await page.screenshot({ path: file, fullPage: true })
      entry.screenshot = file

      // Capture header/footer outer HTML for parity check
      entry.header = await page.evaluate(() => {
        const h = document.querySelector('header')
        return h ? h.outerHTML : null
      })
      entry.footer = await page.evaluate(() => {
        const f = document.querySelector('footer')
        return f ? f.outerHTML : null
      })

      // Find ucbcomedy.com link
      entry.ucbcomedyLink = await page.evaluate(() => {
        const a = document.querySelector('a[href*="ucbcomedy.com"]')
        if (!a) return null
        return {
          href: a.getAttribute('href'),
          target: a.getAttribute('target'),
          rel: a.getAttribute('rel'),
          ariaLabel: a.getAttribute('aria-label'),
          text: a.textContent?.trim(),
          innerHTML: a.innerHTML,
        }
      })
    } catch (e) {
      entry.error = String(e)
    }
    entry.console = consoleMsgs.splice(0)
    results.push(entry)
  }
  await ctx.close()
}
await browser.close()

import { writeFileSync } from 'fs'
writeFileSync(`${OUT}/report.json`, JSON.stringify(results, null, 2))
console.log(JSON.stringify(results.map(r => ({
  viewport: r.viewport,
  route: r.route,
  status: r.status,
  screenshot: r.screenshot,
  hasHeader: !!r.header,
  hasFooter: !!r.footer,
  ucbcomedyLink: r.ucbcomedyLink,
  consoleCount: r.console.length,
  error: r.error,
})), null, 2))
