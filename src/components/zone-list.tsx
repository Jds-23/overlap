import { toast } from 'sonner'
import { ZoneRow } from './zone-row'
import { useClock } from '@/hooks/use-clock'
import { canAddZone } from '@/lib/timezone'

interface ZoneListProps {
  zones: string[]
  homeZone: string
  onAdd: (tz: string) => { ok: boolean; error?: string }
  onRemove: (tz: string) => void
}

export function ZoneList({ zones, homeZone, onAdd, onRemove }: ZoneListProps) {
  const now = useClock()

  const handleAdd = (tz: string) => {
    const result = onAdd(tz)
    if (!result.ok && result.error) {
      toast.error(result.error)
    }
  }

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
      {/* Temporary add button for testing — will be replaced by Cmd+K palette in #4 */}
      <div className="px-6 py-3">
        <button
          onClick={() => {
            const tz = prompt('Enter IANA timezone (e.g. Asia/Tokyo):')
            if (tz) handleAdd(tz)
          }}
          disabled={!canAddZone(zones)}
          className="text-sm text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed"
          data-testid="add-zone-button"
        >
          + Add zone
        </button>
      </div>
    </div>
  )
}
