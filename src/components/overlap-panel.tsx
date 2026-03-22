import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import confetti from 'canvas-confetti'
import { getCityName } from '@/lib/timezone'
import {
  calculateOverlap,
  formatOverlapWindow,
  formatDuration,
  isWeekend,
} from '@/lib/overlap'

interface OverlapPanelProps {
  zones: string[]
  homeZone: string
  date: Date
}

const noOverlapMessages = [
  'Ships passing in the night...',
  'Different hours, same planet.',
  'Time zones said no today.',
]

export function OverlapPanel({ zones, homeZone, date }: OverlapPanelProps) {
  const [selectedZones, setSelectedZones] = useState<Set<string>>(
    () => new Set(zones),
  )

  // Keep selectedZones in sync when zones change
  const activeSelected = useMemo(
    () => new Set(zones.filter((z) => selectedZones.has(z))),
    [zones, selectedZones],
  )

  const toggleZone = (tz: string) => {
    setSelectedZones((prev) => {
      const next = new Set(prev)
      if (next.has(tz)) next.delete(tz)
      else next.add(tz)
      return next
    })
  }

  const selectedArray = zones.filter((z) => activeSelected.has(z))
  const overlap = useMemo(
    () => calculateOverlap(selectedArray, date),
    [selectedArray.join(','), date],
  )

  // Confetti on large overlap (8+ hours = perfect overlap)
  const prevOverlapRef = useRef(0)
  useEffect(() => {
    if (overlap.hasOverlap && overlap.totalMinutes >= 480 && prevOverlapRef.current < 480) {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#5b5ef4', '#22c55e', '#eab308'],
        gravity: 1.2,
        ticks: 150,
      })
    }
    prevOverlapRef.current = overlap.totalMinutes
  }, [overlap.hasOverlap, overlap.totalMinutes])

  // Pick a stable random "no overlap" message per date
  const noOverlapMsg = useMemo(
    () => noOverlapMessages[Math.abs(date.getDate()) % noOverlapMessages.length],
    [date],
  )

  // Check if any selected zone is on a weekend
  const weekendZones = selectedArray.filter((tz) => isWeekend(tz, date))

  if (zones.length < 2) return null

  return (
    <div className="w-full max-w-2xl mx-auto mt-6" data-testid="overlap-panel">
      <div className="px-6 py-3">
        <h2 className="text-lg font-medium text-foreground mb-3">
          Working Hours Overlap
        </h2>

        {/* Zone selection checkboxes */}
        <div className="flex flex-wrap gap-3 mb-4" data-testid="zone-checkboxes">
          {zones.map((tz) => (
            <label
              key={tz}
              className="flex items-center gap-1.5 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={activeSelected.has(tz)}
                onChange={() => toggleZone(tz)}
                className="accent-primary"
                data-testid={`checkbox-${tz}`}
              />
              <span className={tz === homeZone ? 'text-primary' : 'text-foreground'}>
                {getCityName(tz)}
              </span>
            </label>
          ))}
        </div>

        {/* Weekend warnings */}
        {weekendZones.length > 0 && (
          <div className="text-xs text-yellow-400 mb-3">
            Weekend in: {weekendZones.map(getCityName).join(', ')}
          </div>
        )}

        {/* Overlap result */}
        {selectedArray.length < 2 ? (
          <p className="text-sm text-muted-foreground">
            Select at least 2 zones to calculate overlap.
          </p>
        ) : overlap.hasOverlap ? (
          <div data-testid="overlap-result">
            <div className="flex items-baseline gap-2 mb-2">
              <motion.span
                key={overlap.totalMinutes}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-2xl font-bold text-green-400 font-mono"
                data-testid="overlap-duration"
              >
                {formatDuration(overlap.totalMinutes)}
              </motion.span>
              <span className="text-sm text-muted-foreground">overlap</span>
            </div>
            <AnimatePresence mode="wait">
              {overlap.windows.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.25 }}
                  className="border border-border rounded-lg p-3 mb-2"
                  data-testid="overlap-window"
                >
                  {selectedArray.map((tz) => (
                    <div key={tz} className="flex justify-between text-sm py-0.5">
                      <span className={tz === homeZone ? 'text-primary' : 'text-muted-foreground'}>
                        {getCityName(tz)}
                      </span>
                      <span className="font-mono text-foreground">
                        {formatOverlapWindow(w, tz, date)}
                      </span>
                    </div>
                  ))}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div data-testid="no-overlap">
            <p className="text-sm text-red-400 mb-1">{noOverlapMsg}</p>
            {overlap.nearestGapMinutes !== undefined && overlap.nearestGapMinutes > 0 && (
              <p className="text-sm text-muted-foreground" data-testid="nearest-gap">
                Nearest overlap is {formatDuration(overlap.nearestGapMinutes)} away
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
