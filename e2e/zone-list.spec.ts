import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('zone list renders default zones', async ({ page }) => {
  await page.goto('/')
  const rows = page.locator('[data-testid="zone-row"]')
  await expect(rows.first()).toBeVisible()
  expect(await rows.count()).toBeGreaterThanOrEqual(2)
})

test('add a zone via Cmd+K → appears in list', async ({ page }) => {
  await page.goto('/')
  const initialCount = await page.locator('[data-testid="zone-row"]').count()

  await page.keyboard.press('Meta+k')
  await page.locator('[data-testid="command-input"]').fill('Tokyo')
  await page.locator('[data-testid="command-result"]').first().click()

  await expect(page.locator('[data-testid="zone-row"]')).toHaveCount(initialCount + 1)
  await expect(page.locator('[data-timezone="Asia/Tokyo"]')).toBeVisible()
})

test('remove a zone (click ×) → disappears from list', async ({ page }) => {
  await page.goto('/')
  const initialCount = await page.locator('[data-testid="zone-row"]').count()
  expect(initialCount).toBeGreaterThanOrEqual(2)

  const lastRow = page.locator('[data-testid="zone-row"]').last()
  await lastRow.locator('[data-testid="remove-zone"]').click()

  await expect(page.locator('[data-testid="zone-row"]')).toHaveCount(initialCount - 1)
})

test('adding a duplicate → blocked with toast notification', async ({ page }) => {
  await page.goto('/')

  // Get first zone's timezone
  const firstTz = await page.locator('[data-testid="zone-row"]').first().getAttribute('data-timezone')
  const cityName = firstTz!.split('/').pop()!.replace(/_/g, ' ')

  // Try to add duplicate via command palette
  await page.keyboard.press('Meta+k')
  await page.locator('[data-testid="command-input"]').fill(cityName)
  await page.locator('[data-testid="command-result"]').first().click()

  // Toast should appear
  await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 3000 })
})

test('localStorage persistence: add zones, reload → zones still present', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-testid="zone-row"]').first()).toBeVisible()

  // Add a zone via command palette
  await page.keyboard.press('Meta+k')
  await expect(page.locator('[data-testid="command-input"]')).toBeVisible()
  await page.locator('[data-testid="command-input"]').fill('Tokyo')
  await page.locator('[data-testid="command-result"]').first().click()
  await expect(page.locator('[data-timezone="Asia/Tokyo"]')).toBeVisible()

  await page.reload()
  await expect(page.locator('[data-timezone="Asia/Tokyo"]')).toBeVisible()
})
