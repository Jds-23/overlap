import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.locator('[data-testid="zone-row"]').first()).toBeVisible()
})

test('arrow buttons step ±1 day', async ({ page }) => {
  const dateLabel = page.locator('[data-testid="date-label"]')
  const initialText = await dateLabel.textContent()

  // Click next day
  await page.locator('[data-testid="next-day"]').click()
  const nextText = await dateLabel.textContent()
  expect(nextText).not.toBe(initialText)

  // Click prev day twice to go back to yesterday
  await page.locator('[data-testid="prev-day"]').click()
  await page.locator('[data-testid="prev-day"]').click()
  const prevText = await dateLabel.textContent()
  expect(prevText).not.toBe(initialText)
  expect(prevText).not.toBe(nextText)
})

test('calendar popover picks a specific date', async ({ page }) => {
  // Click date label to open calendar
  await page.locator('[data-testid="date-label"]').click()

  // Calendar should appear — look for day cells
  const calendarDays = page.locator('table button')
  await expect(calendarDays.first()).toBeVisible({ timeout: 3000 })

  // Click a day cell that isn't today (pick the first enabled one)
  // Navigate to previous month first to get a clearly different date
  const prevMonthBtn = page.locator('[aria-label="Go to previous month"]')
  if (await prevMonthBtn.isVisible()) {
    await prevMonthBtn.click()
  }

  // Click a day
  const dayButton = page.locator('table button').first()
  await dayButton.click()

  // Back to today button should appear since we picked a past date
  await expect(page.locator('[data-testid="back-to-today"]')).toBeVisible()
})

test('"Back to today" button appears when not on today and navigates back', async ({ page }) => {
  // Initially, back to today should not be visible
  await expect(page.locator('[data-testid="back-to-today"]')).not.toBeVisible()

  // Navigate to next day
  await page.locator('[data-testid="next-day"]').click()

  // Back to today should appear
  await expect(page.locator('[data-testid="back-to-today"]')).toBeVisible()

  // Click it
  await page.locator('[data-testid="back-to-today"]').click()

  // Should disappear
  await expect(page.locator('[data-testid="back-to-today"]')).not.toBeVisible()
})

test('← / → keyboard shortcuts navigate days', async ({ page }) => {
  const dateLabel = page.locator('[data-testid="date-label"]')
  const initialText = await dateLabel.textContent()

  // Press right arrow
  await page.keyboard.press('ArrowRight')
  const nextText = await dateLabel.textContent()
  expect(nextText).not.toBe(initialText)

  // Press left arrow twice
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  const prevText = await dateLabel.textContent()
  expect(prevText).not.toBe(nextText)
})
