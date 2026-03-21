import { useState, useCallback, useEffect } from 'react'
import { addDays, isToday } from '@/lib/timezone'

export function useSelectedDate() {
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  const goToPrevDay = useCallback(() => {
    setSelectedDate((d) => addDays(d, -1))
  }, [])

  const goToNextDay = useCallback(() => {
    setSelectedDate((d) => addDays(d, 1))
  }, [])

  const goToToday = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  const goToDate = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  // Keyboard shortcuts: ← / → for day navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't trigger when focus is in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevDay()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNextDay()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [goToPrevDay, goToNextDay])

  return {
    selectedDate,
    isOnToday: isToday(selectedDate),
    goToPrevDay,
    goToNextDay,
    goToToday,
    goToDate,
  }
}
