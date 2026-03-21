import { useState, useCallback, useEffect } from 'react'
import { getDefaultZones, getHomeZone, MAX_ZONES } from '@/lib/timezone'

const STORAGE_KEY = 'overlap-zones'
const HOME_KEY = 'overlap-home-zone'

function loadZones(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return getDefaultZones()
}

function loadHomeZone(): string {
  try {
    const stored = localStorage.getItem(HOME_KEY)
    if (stored) return stored
  } catch { /* ignore */ }
  return getHomeZone()
}

export function useZones() {
  const [zones, setZones] = useState<string[]>(loadZones)
  const [homeZone] = useState<string>(loadHomeZone)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zones))
  }, [zones])

  useEffect(() => {
    localStorage.setItem(HOME_KEY, homeZone)
  }, [homeZone])

  const addZone = useCallback(
    (tz: string): { ok: boolean; error?: string } => {
      if (zones.includes(tz)) {
        return { ok: false, error: 'Zone already added' }
      }
      if (zones.length >= MAX_ZONES) {
        return { ok: false, error: `Maximum ${MAX_ZONES} zones allowed` }
      }
      setZones((prev) => [...prev, tz])
      return { ok: true }
    },
    [zones],
  )

  const removeZone = useCallback((tz: string) => {
    setZones((prev) => prev.filter((z) => z !== tz))
  }, [])

  return { zones, homeZone, addZone, removeZone }
}
