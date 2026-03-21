import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { formatNavDate } from '@/lib/timezone'

interface DateNavProps {
  selectedDate: Date
  isOnToday: boolean
  onPrevDay: () => void
  onNextDay: () => void
  onToday: () => void
  onDateSelect: (date: Date) => void
}

export function DateNav({
  selectedDate,
  isOnToday,
  onPrevDay,
  onNextDay,
  onToday,
  onDateSelect,
}: DateNavProps) {
  return (
    <div className="flex items-center gap-2" data-testid="date-nav">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevDay}
        aria-label="Previous day"
        data-testid="prev-day"
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger
          className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer px-2 py-1 rounded hover:bg-secondary"
          data-testid="date-label"
        >
          {formatNavDate(selectedDate)}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            defaultMonth={selectedDate}
            data-testid="calendar-popover"
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNextDay}
        aria-label="Next day"
        data-testid="next-day"
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isOnToday && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          data-testid="back-to-today"
          className="ml-2 text-xs h-7"
        >
          Back to today
        </Button>
      )}
    </div>
  )
}
