import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatTime,
  formatDate,
  getUtcOffset,
  getCityName,
  getZoneStatus,
} from '@/lib/timezone'

interface ZoneRowProps {
  timeZone: string
  isHome: boolean
  now: Date
  onRemove: (tz: string) => void
}

const statusColors: Record<string, string> = {
  working: 'text-green-400',
  asleep: 'text-red-400',
  'overlap window': 'text-yellow-400',
}

export function ZoneRow({ timeZone, isHome, now, onRemove }: ZoneRowProps) {
  const status = getZoneStatus(timeZone, now)

  return (
    <div
      className={cn(
        'group flex items-center justify-between px-6 py-4 border-b border-border transition-colors',
        isHome && 'border-l-2 border-l-primary',
      )}
      data-testid="zone-row"
      data-timezone={timeZone}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-foreground font-medium">
            {getCityName(timeZone)}
          </span>
          <span className="text-muted-foreground text-sm">
            {getUtcOffset(timeZone)}
          </span>
          {isHome && (
            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
              Home
            </span>
          )}
        </div>
        <span className="text-muted-foreground text-sm">
          {formatDate(now, timeZone)}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-xl text-foreground" data-testid="zone-time">
            {formatTime(now, timeZone)}
          </span>
          <span className={cn('text-xs', statusColors[status])}>
            {status}
          </span>
        </div>
        <button
          onClick={() => onRemove(timeZone)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
          aria-label={`Remove ${getCityName(timeZone)}`}
          data-testid="remove-zone"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
