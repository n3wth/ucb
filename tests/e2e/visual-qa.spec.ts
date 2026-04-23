import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const OUT_DIR = 'tests/e2e/screenshots'

type Route = {
  name: string
  path: string
  authed?: boolean
}

const ROUTES: Route[] = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'tools', path: '/tools', authed: true },
  { name: 'tools-show-confirmation', path: '/tools/show-confirmation', authed: true },
]

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
]

async function authenticate(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="password"], input[type="password"]', 'local-dev-password')
  await page.getByRole('button', { name: /sign in|continue|log in/i }).first().click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 10_000 }).catch(() => {})
}

for (const viewport of VIEWPORTS) {
  test.describe(`visual QA — ${viewport.name} (${viewport.width}w)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    for (const route of ROUTES) {
      test(`${route.name} ${route.path}`, async ({ page, context }) => {
        const pageErrors: string[] = []
        const failedRequests: string[] = []
        // Ignore console.error noise that merely echoes failed resource loads — we
        // detect those more precisely via 'response'. Track real JS errors via
        // 'pageerror'.
        page.on('pageerror', (err) => pageErrors.push(err.message))
        page.on('response', (resp) => {
          const url = resp.url()
          if (
            resp.status() >= 400 &&
            !/favicon|_vercel\/insights/.test(url)
          ) {
            failedRequests.push(`${resp.status()} ${url}`)
          }
        })

        if (route.authed) {
          await authenticate(page)
        }

        const response = await page.goto(route.path, { waitUntil: 'networkidle' })
        expect(response, `no response for ${route.path}`).not.toBeNull()
        // Allow 200 or 3xx (login redirect). Screenshots capture whatever is shown.
        const status = response!.status()
        expect(status, `unexpected status ${status} for ${route.path}`).toBeLessThan(500)

        const path = `${OUT_DIR}/${route.name}.${viewport.name}.png`
        mkdirSync(dirname(path), { recursive: true })
        await page.screenshot({ path, fullPage: true })

        // Header parity: SiteHeader renders ucbcomedy.com link with target=_blank
        const header = page.locator('header').first()
        await expect(header, `missing header on ${route.path}`).toBeVisible()

        // Footer parity: SiteFooter renders ucbcomedy.com external link
        const footer = page.locator('footer').first()
        await expect(footer, `missing footer on ${route.path}`).toBeVisible()

        expect(
          pageErrors,
          `JS errors on ${route.path}:\n${pageErrors.join('\n')}`,
        ).toEqual([])
        expect(
          failedRequests,
          `failed network requests on ${route.path}:\n${failedRequests.join('\n')}`,
        ).toEqual([])
      })
    }
  })
}

test('ucbcomedy.com link is external and opens in new tab', async ({ page }) => {
  await page.goto('/')
  const link = page
    .locator('a[href="https://ucbcomedy.com"]')
    .first()
  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('rel', /noopener/)
})

test('flow: / → /login → /tools has no visual break', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('header').first()).toBeVisible()
  await expect(page.locator('footer').first()).toBeVisible()

  await page.goto('/login')
  await expect(page.locator('header').first()).toBeVisible()
  await expect(page.locator('footer').first()).toBeVisible()

  await authenticate(page)
  await page.goto('/tools')
  await expect(page.locator('header').first()).toBeVisible()
  await expect(page.locator('footer').first()).toBeVisible()
})
