export const MAX_ZONES = 6

export const DEFAULT_ZONES = ['America/New_York', 'Europe/London']

export function getHomeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function getDefaultZones(): string[] {
  const home = getHomeZone()
  const zones = [home]
  for (const tz of DEFAULT_ZONES) {
    if (!zones.includes(tz)) zones.push(tz)
  }
  return zones.slice(0, MAX_ZONES)
}

export function formatTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(date)
}

export function formatDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(date)
}

export function getUtcOffset(timeZone: string): string {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(now)
  const offsetPart = parts.find((p) => p.type === 'timeZoneName')
  return offsetPart?.value ?? ''
}

export function getCityName(timeZone: string): string {
  const city = timeZone.split('/').pop() ?? timeZone
  return city.replace(/_/g, ' ')
}

export type ZoneStatus = 'working' | 'asleep' | 'overlap window'

export function getZoneStatus(timeZone: string, now: Date = new Date()): ZoneStatus {
  const hour = getHourInZone(timeZone, now)
  if (hour >= 9 && hour < 18) return 'working'
  if (hour >= 18 && hour < 22) return 'overlap window'
  return 'asleep'
}

export function getHourInZone(timeZone: string, now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone,
  }).formatToParts(now)
  const hourPart = parts.find((p) => p.type === 'hour')
  return parseInt(hourPart?.value ?? '0', 10)
}

export function canAddZone(zones: string[]): boolean {
  return zones.length < MAX_ZONES
}

export function isDuplicate(zones: string[], timeZone: string): boolean {
  return zones.includes(timeZone)
}
