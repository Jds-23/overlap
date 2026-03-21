import { ZoneRow } from './zone-row'
import { useClock } from '@/hooks/use-clock'
import { canAddZone } from '@/lib/timezone'

interface ZoneListProps {
  zones: string[]
  homeZone: string
  onRemove: (tz: string) => void
}

export function ZoneList({ zones, homeZone, onRemove }: ZoneListProps) {
  const now = useClock()

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between px-6 py-3">
        <h2 className="text-lg font-medium text-foreground">Time Zones</h2>
        {!canAddZone(zones) && (
          <span className="text-xs text-muted-foreground">Max zones reached</span>
        )}
      </div>
      <div className="border-t border-border" data-testid="zone-list">
        {zones.map((tz) => (
          <ZoneRow
            key={tz}
            timeZone={tz}
            isHome={tz === homeZone}
            now={now}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}
