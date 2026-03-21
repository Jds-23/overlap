import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getCityName, getHourInZone } from '@/lib/timezone'

interface TimePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeZone: string
  onPin: (hours: number, minutes: number, sourceZone: string) => void
}

export function TimePickerDialog({
  open,
  onOpenChange,
  timeZone,
  onPin,
}: TimePickerDialogProps) {
  const now = new Date()
  const currentHour = getHourInZone(timeZone, now)
  const [time, setTime] = useState(
    `${String(currentHour).padStart(2, '0')}:00`,
  )

  const handlePin = () => {
    const [h, m] = time.split(':').map(Number)
    onPin(h!, m!, timeZone)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Pin time in {getCityName(timeZone)}</DialogTitle>
          <DialogDescription>
            Select a time to pin across all zones
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-input border border-border rounded-md px-3 py-2 font-mono text-lg text-foreground"
            data-testid="time-picker-input"
          />
          <Button onClick={handlePin} data-testid="pin-time-button">
            Pin this time
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
