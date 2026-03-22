import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { TimePickerPopover } from '@/components/time-picker-popover'
import {
  formatDate,
  getUtcOffset,
  getCityName,
  getZoneStatus,
  getDayOffset,
} from '@/lib/timezone'

interface ZoneRowProps {
  timeZone: string
  isHome: boolean
  now: Date
  onRemove: (tz: string) => void
  onPin: (hours: number, minutes: number, sourceZone: string) => void
  pinnedDate?: Date | null
  sourceZone?: string | null
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
}

const statusColors: Record<string, string> = {
  working: 'text-green-400',
  asleep: 'text-red-400',
  'overlap window': 'text-yellow-400',
}

const dayLabel: Record<number, string> = {
  1: '+1d',
  [-1]: '-1d',
}

export function ZoneRow({
  timeZone,
  isHome,
  now,
  onRemove,
  onPin,
  pinnedDate,
  sourceZone,
  selectedDate,
  onDateSelect,
}: ZoneRowProps) {
  const displayDate = pinnedDate ?? now
  const status = getZoneStatus(timeZone, displayDate)
  const dayOffset = pinnedDate && sourceZone
    ? getDayOffset(pinnedDate, sourceZone, timeZone)
    : 0

  return (
    <div
      className={cn(
        'group flex items-center justify-between px-6 py-4 border-b border-border transition-colors',
        isHome && 'border-l-2 border-l-primary',
      )}
      data-testid="zone-row"
      data-timezone={timeZone}
    >
      <Popover>
        <PopoverTrigger
          className="flex flex-col gap-0.5 text-left cursor-pointer rounded px-1 -mx-1 hover:bg-secondary transition-colors"
          data-testid="zone-date-trigger"
        >
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
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-sm">
              {formatDate(displayDate, timeZone)}
            </span>
            {dayOffset !== 0 && (
              <span className="text-xs text-yellow-400" data-testid="day-offset">
                {dayLabel[dayOffset]}
              </span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect?.(date)}
            defaultMonth={selectedDate}
            data-testid="zone-calendar-popover"
          />
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end gap-0.5">
          <TimePickerPopover
            timeZone={timeZone}
            displayDate={displayDate}
            isPinned={!!pinnedDate}
            onPin={onPin}
          />
          <AnimatePresence mode="wait">
            <motion.span
              key={status}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={cn('text-xs', statusColors[status])}
            >
              {status}
            </motion.span>
          </AnimatePresence>
        </div>
        <button
          onClick={() => onRemove(timeZone)}
          className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground hover:bg-secondary transition-colors"
          aria-label={`Remove ${getCityName(timeZone)}`}
          data-testid="remove-zone"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
