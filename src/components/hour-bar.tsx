import { useEffect, useRef, useState, useCallback } from 'react'
import { getHourInZone } from '@/lib/timezone'

interface HourBarProps {
  timeZone: string
  now: Date
  onPin: (hours: number, minutes: number, sourceZone: string) => void
  pinnedDate?: Date | null
  sourceZone?: string | null
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const CELL_WIDTH = 40
const SCROLL_STEP = CELL_WIDTH * 4

export function HourBar({ timeZone, now, onPin, pinnedDate }: HourBarProps) {
  const currentHour = getHourInZone(timeZone, now)
  const pinnedHour = pinnedDate ? getHourInZone(timeZone, pinnedDate) : null
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  // Auto-scroll to center current hour on mount
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const targetScroll = currentHour * CELL_WIDTH - el.clientWidth / 2 + CELL_WIDTH / 2
    el.scrollLeft = Math.max(0, targetScroll)
    updateArrows()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update arrows on resize
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const observer = new ResizeObserver(updateArrows)
    observer.observe(el)
    return () => observer.disconnect()
  }, [updateArrows])

  const scroll = (direction: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' })
  }

  return (
    <div className="relative border-b border-border group/bar">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center
            bg-gradient-to-r from-background to-transparent
            text-muted-foreground hover:text-foreground
            opacity-0 group-hover/bar:opacity-100 transition-opacity
            pointer-events-none group-hover/bar:pointer-events-auto"
          aria-label="Scroll hours left"
        >
          ‹
        </button>
      )}

      {/* Hour cells */}
      <div
        ref={scrollRef}
        className="flex px-6 py-0.5 overflow-x-auto scrollbar-hide"
        onScroll={updateArrows}
      >
        {HOURS.map((h) => {
          const isCurrent = h === currentHour
          const isPinned = pinnedHour !== null && h === pinnedHour
          const isWorking = h >= 9 && h < 18

          return (
            <button
              key={h}
              onClick={() => onPin(h, 0, timeZone)}
              className={`flex-shrink-0 text-center text-xs font-mono rounded-sm
                min-w-[40px] h-10 flex items-center justify-center
                transition-colors cursor-pointer
                ${
                  isPinned
                    ? 'bg-primary/20 text-primary ring-1 ring-primary font-semibold'
                    : isCurrent
                      ? 'bg-primary text-white font-semibold'
                      : isWorking
                        ? 'bg-secondary/40 text-muted-foreground hover:bg-secondary'
                        : 'text-muted-foreground/50 hover:bg-secondary/30'
                }`}
            >
              {h}
            </button>
          )
        })}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center
            bg-gradient-to-l from-background to-transparent
            text-muted-foreground hover:text-foreground
            opacity-0 group-hover/bar:opacity-100 transition-opacity
            pointer-events-none group-hover/bar:pointer-events-auto"
          aria-label="Scroll hours right"
        >
          ›
        </button>
      )}
    </div>
  )
}
