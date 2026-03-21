import { useState, useCallback } from 'react'
import { createPinnedDate } from '@/lib/timezone'

interface PinState {
  pinnedDate: Date | null
  sourceZone: string | null
  hours: number
  minutes: number
}

export function usePin() {
  const [pin, setPin] = useState<PinState>({
    pinnedDate: null,
    sourceZone: null,
    hours: 0,
    minutes: 0,
  })

  const pinTime = useCallback((hours: number, minutes: number, sourceZone: string) => {
    const pinnedDate = createPinnedDate(hours, minutes, sourceZone)
    setPin({ pinnedDate, sourceZone, hours, minutes })
  }, [])

  const clearPin = useCallback(() => {
    setPin({ pinnedDate: null, sourceZone: null, hours: 0, minutes: 0 })
  }, [])

  return {
    pinnedDate: pin.pinnedDate,
    sourceZone: pin.sourceZone,
    isPinned: pin.pinnedDate !== null,
    pinTime,
    clearPin,
  }
}
