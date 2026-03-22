import { AnimatePresence, motion } from 'motion/react'
import { ZoneRow } from './zone-row'
import { useClock } from '@/hooks/use-clock'
import { canAddZone } from '@/lib/timezone'

interface ZoneListProps {
  zones: string[]
  homeZone: string
  onRemove: (tz: string) => void
  onPin: (hours: number, minutes: number, sourceZone: string) => void
  pinnedDate?: Date | null
  sourceZone?: string | null
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
}

export function ZoneList({
  zones,
  homeZone,
  onRemove,
  onPin,
  pinnedDate,
  sourceZone,
  selectedDate,
  onDateSelect,
}: ZoneListProps) {
  const now = useClock(selectedDate)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between px-6 py-3">
        <h2 className="text-lg font-medium text-foreground">Time Zones</h2>
        {!canAddZone(zones) && (
          <span className="text-xs text-muted-foreground">Max zones reached</span>
        )}
      </div>
      <div className="border-t border-border" data-testid="zone-list">
        <AnimatePresence initial={false}>
          {zones.map((tz) => (
            <motion.div
              key={tz}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}
            >
              <ZoneRow
                timeZone={tz}
                isHome={tz === homeZone}
                now={now}
                onRemove={onRemove}
                onPin={onPin}
                pinnedDate={pinnedDate}
                sourceZone={sourceZone}
                selectedDate={selectedDate}
                onDateSelect={onDateSelect}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
