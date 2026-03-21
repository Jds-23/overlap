import { test, expect } from '@playwright/test'

test('install banner does NOT appear on 1st visit', async ({ page }) => {
  // Clear storage and visit
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.locator('[data-testid="zone-row"]').first()).toBeVisible()

  // Wait a moment to ensure banner would have appeared
  await page.waitForTimeout(2500)

  // Banner should NOT be visible (1st visit after clear)
  await expect(page.locator('[data-testid="install-banner"]')).not.toBeVisible()
})

test('install banner appears on 2nd visit', async ({ page }) => {
  // Clear storage
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())

  // First visit
  await page.reload()
  await expect(page.locator('[data-testid="zone-row"]').first()).toBeVisible()

  // Second visit (reload increments count to 2)
  await page.reload()
  await expect(page.locator('[data-testid="zone-row"]').first()).toBeVisible()

  // Banner should appear on 2nd visit (after short delay)
  await expect(page.locator('[data-testid="install-banner"]')).toBeVisible({ timeout: 5000 })
})

test('install banner can be dismissed', async ({ page }) => {
  // Setup 2 visits
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.reload()
  await expect(page.locator('[data-testid="zone-row"]').first()).toBeVisible()

  // Wait for banner
  await expect(page.locator('[data-testid="install-banner"]')).toBeVisible({ timeout: 5000 })

  // Dismiss it
  await page.locator('[data-testid="dismiss-install"]').click()
  await expect(page.locator('[data-testid="install-banner"]')).not.toBeVisible()
})
