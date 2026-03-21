import { test, expect } from '@playwright/test'

test('app renders with dark theme', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  await expect(html).toHaveClass(/dark/)
  await expect(page.locator('h1')).toContainText('Overlap')
})
