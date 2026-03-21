import { describe, it, expect } from 'vitest'
import { resolveAlias, searchTimezones } from './tz-search'

describe('resolveAlias', () => {
  it('PT → America/Los_Angeles', () => {
    expect(resolveAlias('PT')).toBe('America/Los_Angeles')
  })

  it('IST → Asia/Kolkata', () => {
    expect(resolveAlias('IST')).toBe('Asia/Kolkata')
  })

  it('ET → America/New_York', () => {
    expect(resolveAlias('ET')).toBe('America/New_York')
  })

  it('unknown alias returns undefined', () => {
    expect(resolveAlias('XYZ')).toBeUndefined()
  })

  it('is case-insensitive', () => {
    expect(resolveAlias('pt')).toBe('America/Los_Angeles')
    expect(resolveAlias('ist')).toBe('Asia/Kolkata')
  })
})

describe('searchTimezones', () => {
  it('returns alias matches for abbreviations', () => {
    const results = searchTimezones('PT')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].timezone).toBe('America/Los_Angeles')
    expect(results[0].matchType).toBe('alias')
  })

  it('returns city matches for city names', () => {
    const results = searchTimezones('Tokyo')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].timezone).toBe('Asia/Tokyo')
    expect(results[0].matchType).toBe('city')
  })

  it('returns empty for empty query', () => {
    expect(searchTimezones('')).toEqual([])
    expect(searchTimezones('   ')).toEqual([])
  })

  it('limits results', () => {
    const results = searchTimezones('A', 5)
    expect(results.length).toBeLessThanOrEqual(5)
  })
})
