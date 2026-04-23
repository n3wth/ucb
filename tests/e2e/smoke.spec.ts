import { test, expect } from '@playwright/test'

test('landing page loads and links to /login', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBeTruthy()

  await expect(
    page.getByRole('heading', { name: /internal tools for the ucb artistic team/i }),
  ).toBeVisible()

  const signIn = page.getByRole('link', { name: /sign in/i }).first()
  await expect(signIn).toHaveAttribute('href', '/login')
})
