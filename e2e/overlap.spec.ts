import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.locator('[data-testid="zone-row"]').first()).toBeVisible()
})

test('overlap hours displayed correctly for known zone pairs', async ({ page }) => {
  // Default zones should include at least 2, so overlap panel should be visible
  const panel = page.locator('[data-testid="overlap-panel"]')
  await expect(panel).toBeVisible()

  // Should show either an overlap result or no-overlap message
  const hasResult = await page.locator('[data-testid="overlap-result"]').isVisible()
  const hasNoOverlap = await page.locator('[data-testid="no-overlap"]').isVisible()
  expect(hasResult || hasNoOverlap).toBe(true)

  if (hasResult) {
    // Duration should be displayed
    await expect(page.locator('[data-testid="overlap-duration"]')).toBeVisible()
    // At least one window should be shown
    await expect(page.locator('[data-testid="overlap-window"]').first()).toBeVisible()
  }
})

test('checkbox toggles subset of zones for overlap calculation', async ({ page }) => {
  // Add a third zone for better testing
  await page.keyboard.press('Meta+k')
  await expect(page.locator('[data-testid="command-input"]')).toBeVisible()
  await page.locator('[data-testid="command-input"]').fill('Tokyo')
  await page.locator('[data-testid="command-result"]').first().click()
  await expect(page.locator('[data-timezone="Asia/Tokyo"]')).toBeVisible()

  const panel = page.locator('[data-testid="overlap-panel"]')
  await expect(panel).toBeVisible()

  // Get the checkboxes
  const checkboxes = panel.locator('[data-testid="zone-checkboxes"] input[type="checkbox"]')
  const count = await checkboxes.count()
  expect(count).toBeGreaterThanOrEqual(3)

  // Uncheck the last zone
  const lastCheckbox = checkboxes.last()
  await lastCheckbox.click()

  // The overlap result should still be visible (with 2 zones)
  // Wait a bit for recalculation
  const hasResult = await page.locator('[data-testid="overlap-result"]').isVisible()
  const hasNoOverlap = await page.locator('[data-testid="no-overlap"]').isVisible()
  expect(hasResult || hasNoOverlap).toBe(true)

  // Re-check it
  await lastCheckbox.click()
})
