/** Common timezone abbreviation aliases */
export const TZ_ALIASES: Record<string, string> = {
  PT: 'America/Los_Angeles',
  PST: 'America/Los_Angeles',
  PDT: 'America/Los_Angeles',
  ET: 'America/New_York',
  EST: 'America/New_York',
  EDT: 'America/New_York',
  CT: 'America/Chicago',
  CST: 'America/Chicago',
  CDT: 'America/Chicago',
  MT: 'America/Denver',
  MST: 'America/Denver',
  MDT: 'America/Denver',
  GMT: 'Europe/London',
  BST: 'Europe/London',
  CET: 'Europe/Berlin',
  CEST: 'Europe/Berlin',
  EET: 'Europe/Helsinki',
  IST: 'Asia/Kolkata',
  JST: 'Asia/Tokyo',
  KST: 'Asia/Seoul',
  CST_CN: 'Asia/Shanghai',
  HKT: 'Asia/Hong_Kong',
  SGT: 'Asia/Singapore',
  AEST: 'Australia/Sydney',
  AEDT: 'Australia/Sydney',
  ACST: 'Australia/Adelaide',
  AWST: 'Australia/Perth',
  NZST: 'Pacific/Auckland',
  NZDT: 'Pacific/Auckland',
  HST: 'Pacific/Honolulu',
  AKST: 'America/Anchorage',
  AKDT: 'America/Anchorage',
  AST: 'America/Puerto_Rico',
  ICT: 'Asia/Bangkok',
  WIB: 'Asia/Jakarta',
  PKT: 'Asia/Karachi',
  GST: 'Asia/Dubai',
  MSK: 'Europe/Moscow',
  WAT: 'Africa/Lagos',
  EAT: 'Africa/Nairobi',
  CAT: 'Africa/Harare',
  SAST: 'Africa/Johannesburg',
  BRT: 'America/Sao_Paulo',
  ART: 'America/Argentina/Buenos_Aires',
}

/** Resolve an alias to an IANA timezone, or undefined */
export function resolveAlias(abbr: string): string | undefined {
  return TZ_ALIASES[abbr.toUpperCase()]
}

let _allTimezones: string[] | null = null

function getAllTimezones(): string[] {
  if (!_allTimezones) {
    _allTimezones = Intl.supportedValuesOf('timeZone')
  }
  return _allTimezones
}

export interface SearchResult {
  timezone: string
  label: string
  matchType: 'alias' | 'city'
}

export function searchTimezones(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return []

  const results: SearchResult[] = []
  const q = query.trim().toLowerCase()
  const seen = new Set<string>()

  // Check aliases first
  const aliasMatch = resolveAlias(q)
  if (aliasMatch && !seen.has(aliasMatch)) {
    seen.add(aliasMatch)
    results.push({
      timezone: aliasMatch,
      label: `${query.toUpperCase()} → ${cityName(aliasMatch)}`,
      matchType: 'alias',
    })
  }

  // Also check partial alias matches
  for (const [abbr, tz] of Object.entries(TZ_ALIASES)) {
    if (abbr.toLowerCase().startsWith(q) && !seen.has(tz)) {
      seen.add(tz)
      results.push({
        timezone: tz,
        label: `${abbr} → ${cityName(tz)}`,
        matchType: 'alias',
      })
    }
    if (results.length >= limit) return results
  }

  // Search city names
  for (const tz of getAllTimezones()) {
    if (seen.has(tz)) continue
    const city = cityName(tz).toLowerCase()
    const region = tz.toLowerCase()
    if (city.includes(q) || region.includes(q)) {
      seen.add(tz)
      results.push({
        timezone: tz,
        label: cityName(tz),
        matchType: 'city',
      })
    }
    if (results.length >= limit) break
  }

  return results
}

function cityName(tz: string): string {
  const parts = tz.split('/')
  return (parts[parts.length - 1] ?? tz).replace(/_/g, ' ')
}
