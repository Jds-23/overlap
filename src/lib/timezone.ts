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

/**
 * Given a time (hours, minutes) in sourceZone, create a Date representing
 * that moment, then return the equivalent Date object.
 */
export function createPinnedDate(
  hours: number,
  minutes: number,
  sourceZone: string,
  referenceDate: Date = new Date(),
): Date {
  // Get the current date parts in the source timezone
  const dateParts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: sourceZone,
  }).formatToParts(referenceDate)

  const year = parseInt(dateParts.find((p) => p.type === 'year')!.value)
  const month = parseInt(dateParts.find((p) => p.type === 'month')!.value)
  const day = parseInt(dateParts.find((p) => p.type === 'day')!.value)

  // Create an ISO string for the desired time in the source timezone
  // We need to find the UTC offset for the source timezone at this date
  const tempDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)

  // Get the offset by comparing formatter output to UTC
  const utcStr = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: sourceZone,
  }).format(tempDate)

  // Parse what the formatter says the time is in sourceZone
  const match = utcStr.match(/(\d+)\/(\d+)\/(\d+),\s*(\d+):(\d+):(\d+)/)
  if (!match) return tempDate

  const [, fMonth, fDay, fYear, fHour, fMin] = match.map(Number)

  // Calculate the difference between what we want and what we got
  const wantedMinutes = hours * 60 + minutes
  const gotMinutes = fHour! * 60 + fMin!

  // Adjust — also account for possible date difference
  const wantedDate = new Date(year, month - 1, day)
  const gotDate = new Date(fYear!, fMonth! - 1, fDay!)
  const dayDiff = Math.round((wantedDate.getTime() - gotDate.getTime()) / 86400000)

  const minuteDiff = wantedMinutes - gotMinutes + dayDiff * 1440
  return new Date(tempDate.getTime() + minuteDiff * 60000)
}

/**
 * Detect day boundary: returns +1, -1, or 0 comparing the date in targetZone
 * to the date in sourceZone for the given moment.
 */
export function getDayOffset(
  pinnedDate: Date,
  sourceZone: string,
  targetZone: string,
): number {
  const sourceDay = getDayOfYear(pinnedDate, sourceZone)
  const targetDay = getDayOfYear(pinnedDate, targetZone)

  if (targetDay > sourceDay) return 1
  if (targetDay < sourceDay) return -1
  return 0
}

/** Add (or subtract) days from a date */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/** Check if two dates are the same calendar day */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Check if a date is today */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/** Format a date for display in the date nav header */
export function formatNavDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

/**
 * Replace the date portion of `base` with `selectedDate` while keeping
 * the time-of-day from `base`. Used to shift live clocks to a different day.
 */
export function withDate(base: Date, selectedDate: Date): Date {
  const result = new Date(base)
  result.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
  return result
}

function getDayOfYear(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).formatToParts(date)

  const year = parseInt(parts.find((p) => p.type === 'year')!.value)
  const month = parseInt(parts.find((p) => p.type === 'month')!.value)
  const day = parseInt(parts.find((p) => p.type === 'day')!.value)

  const start = new Date(year, 0, 1)
  const current = new Date(year, month - 1, day)
  return Math.floor((current.getTime() - start.getTime()) / 86400000)
}
