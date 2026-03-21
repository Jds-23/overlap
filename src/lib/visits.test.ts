import { describe, it, expect, beforeEach } from 'vitest'
import { getVisitCount, incrementVisitCount, shouldShowInstallBanner } from './visits'

describe('visit count tracking', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts at 0', () => {
    expect(getVisitCount()).toBe(0)
  })

  it('increments on each call', () => {
    expect(incrementVisitCount()).toBe(1)
    expect(incrementVisitCount()).toBe(2)
    expect(incrementVisitCount()).toBe(3)
  })

  it('returns correct count after increments', () => {
    incrementVisitCount()
    incrementVisitCount()
    expect(getVisitCount()).toBe(2)
  })

  it('shouldShowInstallBanner returns false on 1st visit', () => {
    incrementVisitCount() // visit 1
    expect(shouldShowInstallBanner()).toBe(false)
  })

  it('shouldShowInstallBanner returns true on 2nd visit', () => {
    incrementVisitCount() // visit 1
    incrementVisitCount() // visit 2
    expect(shouldShowInstallBanner()).toBe(true)
  })
})
