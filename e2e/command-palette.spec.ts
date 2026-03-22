import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('Cmd+K opens the command palette', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Meta+k')
  await expect(page.locator('[data-testid="command-input"]')).toBeVisible()
})

test('typing a search term filters results', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Meta+k')
  await page.locator('[data-testid="command-input"]').fill('Tokyo')
  const results = page.locator('[data-testid="command-result"]')
  await expect(results.first()).toBeVisible()
  await expect(results.first()).toContainText('Tokyo')
})

test('selecting a result adds the zone to the list', async ({ page }) => {
  await page.goto('/')
  const initialCount = await page.locator('[data-testid="zone-row"]').count()

  await page.keyboard.press('Meta+k')
  await page.locator('[data-testid="command-input"]').fill('Tokyo')
  await page.locator('[data-testid="command-result"]').first().click()

  // Palette should close
  await expect(page.locator('[data-testid="command-input"]')).not.toBeVisible()

  // Zone should be added
  await expect(page.locator('[data-testid="zone-row"]')).toHaveCount(initialCount + 1)
  await expect(page.locator('[data-timezone="Asia/Tokyo"]')).toBeVisible()
})

test('Esc closes the palette without side effects', async ({ page }) => {
  await page.goto('/')
  const initialCount = await page.locator('[data-testid="zone-row"]').count()

  await page.keyboard.press('Meta+k')
  await expect(page.locator('[data-testid="command-input"]')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.locator('[data-testid="command-input"]')).not.toBeVisible()

  // No zones added
  await expect(page.locator('[data-testid="zone-row"]')).toHaveCount(initialCount)
})

test('add-zone button opens the command palette', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-testid="add-zone-button"]').click()
  await expect(page.locator('[data-testid="command-input"]')).toBeVisible()
})

test('add zone via button and search', async ({ page }) => {
  await page.goto('/')
  const initialCount = await page.locator('[data-testid="zone-row"]').count()

  await page.locator('[data-testid="add-zone-button"]').click()
  await page.locator('[data-testid="command-input"]').fill('Tokyo')
  await page.locator('[data-testid="command-result"]').first().click()

  await expect(page.locator('[data-testid="command-input"]')).not.toBeVisible()
  await expect(page.locator('[data-testid="zone-row"]')).toHaveCount(initialCount + 1)
  await expect(page.locator('[data-timezone="Asia/Tokyo"]')).toBeVisible()
})

test('abbreviation search works (PT → Los Angeles)', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Meta+k')
  await expect(page.locator('[data-testid="command-input"]')).toBeVisible()
  await page.locator('[data-testid="command-input"]').fill('PT')
  const results = page.locator('[data-testid="command-result"]')
  await expect(results.first()).toBeVisible()
  await expect(results.first()).toContainText('Los Angeles')
})
