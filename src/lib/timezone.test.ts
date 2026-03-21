import { describe, it, expect } from 'vitest'
import {
  getHomeZone,
  canAddZone,
  isDuplicate,
  getZoneStatus,
  createPinnedDate,
  getDayOffset,
  formatTime,
  MAX_ZONES,
} from './timezone'

describe('getHomeZone', () => {
  it('returns a valid IANA timezone string', () => {
    const tz = getHomeZone()
    expect(typeof tz).toBe('string')
    expect(tz).toContain('/')
  })
})

describe('canAddZone / MAX_ZONES enforcement', () => {
  it('allows adding when under limit', () => {
    expect(canAddZone(['America/New_York'])).toBe(true)
  })

  it('rejects adding 7th zone', () => {
    const zones = Array.from({ length: MAX_ZONES }, (_, i) => `Zone/${i}`)
    expect(canAddZone(zones)).toBe(false)
  })
})

describe('isDuplicate', () => {
  it('detects duplicates', () => {
    expect(isDuplicate(['America/New_York'], 'America/New_York')).toBe(true)
  })

  it('allows non-duplicates', () => {
    expect(isDuplicate(['America/New_York'], 'Europe/London')).toBe(false)
  })
})

describe('getZoneStatus', () => {
  it('returns "working" during business hours (9-17)', () => {
    // Create a date that is 10:00 in UTC, test with UTC timezone
    const date = new Date('2026-03-22T10:00:00Z')
    expect(getZoneStatus('UTC', date)).toBe('working')
  })

  it('returns "overlap window" during evening (18-21)', () => {
    const date = new Date('2026-03-22T19:00:00Z')
    expect(getZoneStatus('UTC', date)).toBe('overlap window')
  })

  it('returns "asleep" during night hours', () => {
    const date = new Date('2026-03-22T03:00:00Z')
    expect(getZoneStatus('UTC', date)).toBe('asleep')
  })
})

describe('createPinnedDate', () => {
  it('creates a date representing the given time in the source zone', () => {
    // Pin 14:30 in UTC
    const pinned = createPinnedDate(14, 30, 'UTC')
    const time = formatTime(pinned, 'UTC')
    expect(time).toMatch(/2:30\s*PM/i)
  })

  it('cross-zone conversion: pin in zone A, read in zone B', () => {
    // Pin 10:00 AM in New York (UTC-5 in winter, UTC-4 in summer)
    const pinned = createPinnedDate(10, 0, 'America/New_York')
    const nyTime = formatTime(pinned, 'America/New_York')
    expect(nyTime).toMatch(/10:00\s*AM/i)

    // London is 5h ahead of NY (EST) or 4h ahead (EDT)
    const londonTime = formatTime(pinned, 'Europe/London')
    // Should be either 2:00 PM or 3:00 PM depending on DST
    expect(londonTime).toMatch(/(2|3):00\s*PM/i)
  })
})

describe('getDayOffset', () => {
  it('returns 0 when same calendar day in both zones', () => {
    // 12:00 UTC — same day everywhere reasonable
    const date = new Date('2026-03-22T12:00:00Z')
    expect(getDayOffset(date, 'UTC', 'America/New_York')).toBe(0)
  })

  it('returns +1 when target zone is on next day', () => {
    // 23:00 UTC = next day in Tokyo (UTC+9 = 08:00 next day)
    const date = new Date('2026-03-22T23:00:00Z')
    expect(getDayOffset(date, 'UTC', 'Asia/Tokyo')).toBe(1)
  })

  it('returns -1 when target zone is on previous day', () => {
    // 01:00 UTC = previous day in Honolulu (UTC-10 = 15:00 previous day)
    const date = new Date('2026-03-22T01:00:00Z')
    expect(getDayOffset(date, 'UTC', 'Pacific/Honolulu')).toBe(-1)
  })
})
