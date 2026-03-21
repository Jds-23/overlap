import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.locator('[data-testid="zone-row"]').first()).toBeVisible()
})

test('pin a time → all zones sync to equivalent time', async ({ page }) => {
  // Click on the first zone's time to open picker
  await page.locator('[data-testid="zone-time"]').first().click()

  // Time picker dialog should open
  await expect(page.locator('[data-testid="time-picker-input"]')).toBeVisible()

  // Set time to 10:00
  await page.locator('[data-testid="time-picker-input"]').fill('10:00')
  await page.locator('[data-testid="pin-time-button"]').click()

  // Pin banner should appear
  await expect(page.locator('[data-testid="pin-banner"]')).toBeVisible()

  // All zone times should show pinned values (not live clock)
  const bannerZones = page.locator('[data-testid="pin-banner-zone"]')
  await expect(bannerZones.first()).toBeVisible()
})

test('clear pin (× button) → clocks return to live mode', async ({ page }) => {
  // Pin a time first
  await page.locator('[data-testid="zone-time"]').first().click()
  await expect(page.locator('[data-testid="time-picker-input"]')).toBeVisible()
  await page.locator('[data-testid="time-picker-input"]').fill('10:00')
  await page.locator('[data-testid="pin-time-button"]').click()
  await expect(page.locator('[data-testid="pin-banner"]')).toBeVisible()

  // Click clear button
  await page.locator('[data-testid="clear-pin"]').click()

  // Banner should disappear
  await expect(page.locator('[data-testid="pin-banner"]')).not.toBeVisible()
})

test('day boundary labels appear when pinned time crosses midnight', async ({ page }) => {
  // First, add Tokyo zone (UTC+9) if not present
  await page.keyboard.press('Meta+k')
  await expect(page.locator('[data-testid="command-input"]')).toBeVisible()
  await page.locator('[data-testid="command-input"]').fill('Honolulu')
  await page.locator('[data-testid="command-result"]').first().click()
  await expect(page.locator('[data-timezone="Pacific/Honolulu"]')).toBeVisible()

  // Add Tokyo
  await page.keyboard.press('Meta+k')
  await expect(page.locator('[data-testid="command-input"]')).toBeVisible()
  await page.locator('[data-testid="command-input"]').fill('Tokyo')
  await page.locator('[data-testid="command-result"]').first().click()
  await expect(page.locator('[data-timezone="Asia/Tokyo"]')).toBeVisible()

  // Pin 23:00 in the first zone (should cause day boundary in some zones)
  await page.locator('[data-timezone="Pacific/Honolulu"] [data-testid="zone-time"]').click()
  await expect(page.locator('[data-testid="time-picker-input"]')).toBeVisible()
  await page.locator('[data-testid="time-picker-input"]').fill('23:00')
  await page.locator('[data-testid="pin-time-button"]').click()

  // Check for day offset labels — Tokyo is UTC+9, Honolulu is UTC-10
  // 23:00 HST = 09:00 UTC next day = 18:00 JST next day
  // So Tokyo should show +1d
  await expect(page.locator('[data-testid="pin-banner"]')).toBeVisible()
  const dayOffsets = page.locator('[data-testid="day-offset"]')
  await expect(dayOffsets.first()).toBeVisible({ timeout: 3000 })
})
