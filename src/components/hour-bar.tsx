import { getHourInZone } from '@/lib/timezone'

interface HourBarProps {
  timeZone: string
  now: Date
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function HourBar({ timeZone, now }: HourBarProps) {
  const currentHour = getHourInZone(timeZone, now)

  return (
    <div className="flex px-6 py-0.5 overflow-x-auto border-b border-border">
      {HOURS.map((h) => {
        const isCurrent = h === currentHour
        const isWorking = h >= 9 && h < 18

        return (
          <span
            key={h}
            className={`flex-1 text-center text-[10px] font-mono leading-4 rounded-sm ${
              isCurrent
                ? 'bg-primary text-white font-semibold'
                : isWorking
                  ? 'bg-secondary/40 text-muted-foreground'
                  : 'text-muted-foreground/50'
            }`}
          >
            {h}
          </span>
        )
      })}
    </div>
  )
}
