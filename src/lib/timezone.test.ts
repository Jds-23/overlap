import { describe, it, expect } from 'vitest'
import {
  getHomeZone,
  canAddZone,
  isDuplicate,
  getZoneStatus,
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
