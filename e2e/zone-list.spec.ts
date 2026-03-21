import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Clear localStorage before each test
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('zone list renders default zones', async ({ page }) => {
  await page.goto('/')
  const rows = page.locator('[data-testid="zone-row"]')
  await expect(rows.first()).toBeVisible()
  // Should have at least 2 default zones (home + others)
  expect(await rows.count()).toBeGreaterThanOrEqual(2)
})

test('add a zone → appears in list', async ({ page }) => {
  await page.goto('/')
  const initialCount = await page.locator('[data-testid="zone-row"]').count()

  // Use dialog to add a zone
  page.on('dialog', (dialog) => dialog.accept('Asia/Tokyo'))
  await page.locator('[data-testid="add-zone-button"]').click()

  const rows = page.locator('[data-testid="zone-row"]')
  await expect(rows).toHaveCount(initialCount + 1)
  await expect(page.locator('[data-timezone="Asia/Tokyo"]')).toBeVisible()
})

test('remove a zone (hover ×) → disappears from list', async ({ page }) => {
  await page.goto('/')
  const initialCount = await page.locator('[data-testid="zone-row"]').count()
  expect(initialCount).toBeGreaterThanOrEqual(2)

  // Hover over the last row and click remove
  const lastRow = page.locator('[data-testid="zone-row"]').last()
  await lastRow.hover()
  await lastRow.locator('[data-testid="remove-zone"]').click()

  await expect(page.locator('[data-testid="zone-row"]')).toHaveCount(initialCount - 1)
})

test('adding a duplicate → blocked with toast notification', async ({ page }) => {
  await page.goto('/')

  // Get the timezone of the first row
  const firstTz = await page.locator('[data-testid="zone-row"]').first().getAttribute('data-timezone')

  // Try to add it again
  page.on('dialog', (dialog) => dialog.accept(firstTz!))
  await page.locator('[data-testid="add-zone-button"]').click()

  // Toast should appear
  await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 3000 })
})

test('localStorage persistence: add zones, reload → zones still present', async ({ page }) => {
  await page.goto('/')

  // Add a zone
  page.on('dialog', (dialog) => dialog.accept('Asia/Tokyo'))
  await page.locator('[data-testid="add-zone-button"]').click()
  await expect(page.locator('[data-timezone="Asia/Tokyo"]')).toBeVisible()

  // Reload
  await page.reload()

  // Zone should still be there
  await expect(page.locator('[data-timezone="Asia/Tokyo"]')).toBeVisible()
})
