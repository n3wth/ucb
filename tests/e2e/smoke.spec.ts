import { test, expect } from '@playwright/test'

test('landing page loads and links to /login', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBeTruthy()

  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toBeVisible()
  await expect(heading).toContainText(/internal tools/i)
  await expect(heading).toContainText(/artistic team/i)

  const signIn = page.getByRole('link', { name: /sign in/i }).first()
  await expect(signIn).toHaveAttribute('href', '/login')
})
