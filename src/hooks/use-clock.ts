import { useState, useEffect } from 'react'
import { withDate, isToday } from '@/lib/timezone'

export function useClock(selectedDate?: Date): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // If a selected date is provided and it's not today, shift the live clock
  if (selectedDate && !isToday(selectedDate)) {
    return withDate(now, selectedDate)
  }

  return now
}
