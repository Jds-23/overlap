import { X } from 'lucide-react'
import { formatTime, getCityName, getDayOffset } from '@/lib/timezone'

interface PinBannerProps {
  pinnedDate: Date
  sourceZone: string
  zones: string[]
  onClear: () => void
}

const dayLabel: Record<number, string> = {
  1: '+1d',
  [-1]: '-1d',
}

export function PinBanner({ pinnedDate, sourceZone, zones, onClear }: PinBannerProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur border-b border-border"
      data-testid="pin-banner"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4 overflow-x-auto">
          {zones.map((tz) => {
            const offset = getDayOffset(pinnedDate, sourceZone, tz)
            return (
              <div
                key={tz}
                className="flex items-center gap-1.5 shrink-0"
                data-testid="pin-banner-zone"
                data-timezone={tz}
              >
                <span className="text-xs text-muted-foreground">
                  {getCityName(tz)}
                </span>
                <span className="font-mono text-sm text-foreground" data-testid="pin-banner-time">
                  {formatTime(pinnedDate, tz)}
                </span>
                {offset !== 0 && (
                  <span className="text-xs text-yellow-400" data-testid="day-offset">
                    {dayLabel[offset]}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <button
          onClick={onClear}
          className="ml-4 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Clear pinned time"
          data-testid="clear-pin"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
