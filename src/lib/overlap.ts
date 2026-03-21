/**
 * Overlap calculation for working hours across time zones.
 * Working hours: 09:00–17:59 local time.
 */

const WORK_START = 9 // 09:00
const WORK_END = 18 // 18:00 (exclusive, so 17:59 is last working minute)

/** Weekend days per country/region */
const FRIDAY_SATURDAY_WEEKEND = new Set(['AE', 'SA', 'IL'])

/** Map IANA timezone to country code for weekend detection */
const TZ_COUNTRY: Record<string, string> = {
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Jerusalem': 'IL',
  'Asia/Tel_Aviv': 'IL',
}

export type WeekendDays = [number, number] // day-of-week numbers (0=Sun)

export function getWeekendDays(timeZone: string): WeekendDays {
  const country = TZ_COUNTRY[timeZone]
  if (country && FRIDAY_SATURDAY_WEEKEND.has(country)) {
    return [5, 6] // Friday=5, Saturday=6
  }
  return [0, 6] // Sunday=0, Saturday=6
}

export function isWeekend(timeZone: string, date: Date): boolean {
  const dayOfWeek = getDayOfWeekInZone(timeZone, date)
  const [a, b] = getWeekendDays(timeZone)
  return dayOfWeek === a || dayOfWeek === b
}

function getDayOfWeekInZone(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone,
  }).formatToParts(date)
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? ''
  const map: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  }
  return map[weekday] ?? 0
}

/**
 * Get the UTC offset in minutes for a timezone at a given date.
 * Uses Intl to resolve the actual offset (handles DST).
 */
export function getUtcOffsetMinutes(timeZone: string, date: Date = new Date()): number {
  // Format date in both UTC and the target timezone, then compute difference
  const utcParts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false, timeZone: 'UTC',
  }).formatToParts(date)

  const tzParts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false, timeZone,
  }).formatToParts(date)

  const toMinutes = (parts: Intl.DateTimeFormatPart[]) => {
    const y = parseInt(parts.find((p) => p.type === 'year')!.value)
    const m = parseInt(parts.find((p) => p.type === 'month')!.value)
    const d = parseInt(parts.find((p) => p.type === 'day')!.value)
    const h = parseInt(parts.find((p) => p.type === 'hour')!.value)
    const min = parseInt(parts.find((p) => p.type === 'minute')!.value)
    // Convert to total minutes from epoch-ish reference
    return ((y * 366 + m * 31 + d) * 24 + h) * 60 + min
  }

  return toMinutes(tzParts) - toMinutes(utcParts)
}

export interface OverlapWindow {
  /** Start hour in UTC (0-23) */
  startUtc: number
  /** Start minute in UTC */
  startMinuteUtc: number
  /** End hour in UTC (0-23) */
  endUtc: number
  /** End minute in UTC */
  endMinuteUtc: number
  /** Duration in minutes */
  durationMinutes: number
}

export interface OverlapResult {
  hasOverlap: boolean
  windows: OverlapWindow[]
  /** Total overlap in minutes */
  totalMinutes: number
  /** If no overlap, the nearest window info */
  nearestGapMinutes?: number
}

/**
 * Calculate working-hours overlap across selected zones for a given date.
 * Returns the common window(s) where all selected zones are in working hours.
 */
export function calculateOverlap(
  zones: string[],
  date: Date = new Date(),
): OverlapResult {
  if (zones.length === 0) {
    return { hasOverlap: false, windows: [], totalMinutes: 0 }
  }

  // For each zone, compute working hours in UTC minutes (0-1439)
  const workRanges = zones.map((tz) => {
    const offset = getUtcOffsetMinutes(tz, date)
    // Working hours in local time: WORK_START*60 to WORK_END*60
    // Convert to UTC: subtract offset
    let startUtc = WORK_START * 60 - offset
    let endUtc = WORK_END * 60 - offset

    // Normalize to 0-1439 range
    startUtc = ((startUtc % 1440) + 1440) % 1440
    endUtc = ((endUtc % 1440) + 1440) % 1440

    return { startUtc, endUtc, wraps: endUtc <= startUtc }
  })

  // Find intersection of all work ranges using a minute-level bitmap
  const bitmap = new Uint8Array(1440)
  bitmap.fill(1)

  for (const range of workRanges) {
    const mask = new Uint8Array(1440)
    if (range.wraps) {
      // Wraps around midnight: e.g. 22:00 UTC to 06:00 UTC
      for (let m = range.startUtc; m < 1440; m++) mask[m] = 1
      for (let m = 0; m < range.endUtc; m++) mask[m] = 1
    } else {
      for (let m = range.startUtc; m < range.endUtc; m++) mask[m] = 1
    }
    for (let m = 0; m < 1440; m++) {
      bitmap[m] = bitmap[m]! & mask[m]!
    }
  }

  // Extract contiguous windows from bitmap
  const windows: OverlapWindow[] = []
  let inWindow = false
  let windowStart = 0

  for (let m = 0; m < 1440; m++) {
    if (bitmap[m] && !inWindow) {
      inWindow = true
      windowStart = m
    } else if (!bitmap[m] && inWindow) {
      inWindow = false
      windows.push({
        startUtc: Math.floor(windowStart / 60),
        startMinuteUtc: windowStart % 60,
        endUtc: Math.floor(m / 60),
        endMinuteUtc: m % 60,
        durationMinutes: m - windowStart,
      })
    }
  }
  // Handle wrap-around: if bitmap starts and ends with 1s
  if (inWindow) {
    // Check if it connects to the start
    if (bitmap[0] && windows.length > 0) {
      // Merge with first window
      const first = windows[0]!
      const endMinute = first.endUtc * 60 + first.endMinuteUtc
      const totalDuration = (1440 - windowStart) + endMinute
      windows[0] = {
        startUtc: Math.floor(windowStart / 60),
        startMinuteUtc: windowStart % 60,
        endUtc: first.endUtc,
        endMinuteUtc: first.endMinuteUtc,
        durationMinutes: totalDuration,
      }
    } else {
      windows.push({
        startUtc: Math.floor(windowStart / 60),
        startMinuteUtc: windowStart % 60,
        endUtc: 24,
        endMinuteUtc: 0,
        durationMinutes: 1440 - windowStart,
      })
    }
  }

  const totalMinutes = windows.reduce((sum, w) => sum + w.durationMinutes, 0)

  if (totalMinutes > 0) {
    return { hasOverlap: true, windows, totalMinutes }
  }

  // No overlap — find nearest gap
  const nearestGapMinutes = findNearestGap(workRanges)

  return { hasOverlap: false, windows: [], totalMinutes: 0, nearestGapMinutes }
}

function findNearestGap(
  workRanges: { startUtc: number; endUtc: number; wraps: boolean }[],
): number {
  if (workRanges.length < 2) return 0

  // Find the minimum gap between any two non-overlapping ranges
  let minGap = 1440

  // For each pair, compute the gap
  for (let i = 0; i < workRanges.length; i++) {
    for (let j = i + 1; j < workRanges.length; j++) {
      const a = workRanges[i]!
      const b = workRanges[j]!

      // Calculate gap in both directions
      const gap1 = ((b.startUtc - a.endUtc) % 1440 + 1440) % 1440
      const gap2 = ((a.startUtc - b.endUtc) % 1440 + 1440) % 1440
      const gap = Math.min(gap1, gap2)

      if (gap > 0 && gap < minGap) {
        minGap = gap
      }
    }
  }

  return minGap === 1440 ? 0 : minGap
}

/**
 * Format an overlap window for display in a specific timezone.
 */
export function formatOverlapWindow(
  window: OverlapWindow,
  timeZone: string,
  date: Date = new Date(),
): string {
  const offset = getUtcOffsetMinutes(timeZone, date)

  const startLocal = (window.startUtc * 60 + window.startMinuteUtc + offset + 1440) % 1440
  const endLocal = (window.endUtc * 60 + window.endMinuteUtc + offset + 1440) % 1440

  return `${formatMinutes(startLocal)} – ${formatMinutes(endLocal)}`
}

function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
  return m === 0 ? `${displayH} ${period}` : `${displayH}:${String(m).padStart(2, '0')} ${period}`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}
