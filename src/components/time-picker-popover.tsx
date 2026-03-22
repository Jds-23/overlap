import { useRef, useCallback, useEffect, useState } from 'react'
import { Calligraph } from 'calligraph'
import { Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { formatTime, getHourInZone } from '@/lib/timezone'

interface TimePickerPopoverProps {
  timeZone: string
  displayDate: Date
  isPinned: boolean
  onPin: (hours: number, minutes: number, sourceZone: string) => void
}

function getMinuteInZone(timeZone: string, now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    minute: 'numeric',
    timeZone,
  }).formatToParts(now)
  const minutePart = parts.find((p) => p.type === 'minute')
  return parseInt(minutePart?.value ?? '0', 10)
}

function ScrollWheel({
  value,
  max,
  onChange,
  label,
}: {
  value: number
  max: number
  onChange: (v: number) => void
  label: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemHeight = 32
  const isScrolling = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el || isScrolling.current) return
    el.scrollTop = value * itemHeight
  }, [value])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    isScrolling.current = true
    const index = Math.round(el.scrollTop / itemHeight)
    const clamped = Math.max(0, Math.min(max, index))
    if (clamped !== value) {
      onChange(clamped)
    }
    // Reset scrolling flag after scroll settles
    clearTimeout((el as unknown as Record<string, ReturnType<typeof setTimeout>>).__scrollTimeout)
    ;(el as unknown as Record<string, ReturnType<typeof setTimeout>>).__scrollTimeout = setTimeout(() => {
      isScrolling.current = false
    }, 100)
  }, [value, max, onChange])

  const items = Array.from({ length: max + 1 }, (_, i) => i)

  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{label}</span>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[96px] w-[52px] overflow-y-auto snap-y snap-mandatory scrollbar-hide rounded-md bg-secondary/50"
        style={{ scrollbarWidth: 'none' }}
      >
        <div style={{ height: itemHeight }} />
        {items.map((i) => (
          <button
            key={i}
            className={cn(
              'w-full h-8 flex items-center justify-center font-mono text-sm snap-center transition-colors cursor-pointer',
              i === value
                ? 'text-primary font-bold text-base'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => {
              onChange(i)
              const el = containerRef.current
              if (el) {
                el.scrollTo({ top: i * itemHeight, behavior: 'smooth' })
              }
            }}
          >
            {String(i).padStart(2, '0')}
          </button>
        ))}
        <div style={{ height: itemHeight }} />
      </div>
    </div>
  )
}

export function TimePickerPopover({
  timeZone,
  displayDate,
  isPinned,
  onPin,
}: TimePickerPopoverProps) {
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState(() => getHourInZone(timeZone))
  const [minute, setMinute] = useState(() => getMinuteInZone(timeZone))

  // Reset to current time when opening
  useEffect(() => {
    if (open) {
      const now = new Date()
      setHour(getHourInZone(timeZone, now))
      setMinute(getMinuteInZone(timeZone, now))
    }
  }, [open, timeZone])

  const handleHourChange = useCallback(
    (h: number) => {
      setHour(h)
      onPin(h, minute, timeZone)
    },
    [minute, timeZone, onPin],
  )

  const handleMinuteChange = useCallback(
    (m: number) => {
      setMinute(m)
      onPin(hour, m, timeZone)
    },
    [hour, timeZone, onPin],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="font-mono text-xl text-foreground hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
        data-testid="zone-time"
        title="Click to pin this time"
      >
        <Calligraph>{formatTime(displayDate, timeZone)}</Calligraph>
        {isPinned && <Pin className="w-3 h-3 text-primary" />}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="end">
        <div className="flex items-start gap-2">
          <ScrollWheel value={hour} max={23} onChange={handleHourChange} label="hr" />
          <span className="font-mono text-lg text-muted-foreground mt-6">:</span>
          <ScrollWheel value={minute} max={59} onChange={handleMinuteChange} label="min" />
        </div>
      </PopoverContent>
    </Popover>
  )
}
