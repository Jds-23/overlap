import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { ZoneList } from '@/components/zone-list'
import { CommandPalette } from '@/components/command-palette'
import { PinBanner } from '@/components/pin-banner'
import { TimePickerDialog } from '@/components/time-picker-dialog'
import { DateNav } from '@/components/date-nav'
import { OverlapPanel } from '@/components/overlap-panel'
import { useZones } from '@/hooks/use-zones'
import { usePin } from '@/hooks/use-pin'
import { useSelectedDate } from '@/hooks/use-selected-date'

function App() {
  const { zones, homeZone, addZone, removeZone } = useZones()
  const { pinnedDate, sourceZone, isPinned, pinTime, clearPin } = usePin()
  const {
    selectedDate,
    isOnToday,
    goToPrevDay,
    goToNextDay,
    goToToday,
    goToDate,
  } = useSelectedDate()
  const [pickerZone, setPickerZone] = useState<string | null>(null)

  const handlePinClick = (tz: string) => {
    setPickerZone(tz)
  }

  return (
    <div className={isPinned ? 'pt-12' : ''}>
      {isPinned && pinnedDate && sourceZone && (
        <PinBanner
          pinnedDate={pinnedDate}
          sourceZone={sourceZone}
          zones={zones}
          onClear={clearPin}
        />
      )}
      <div className="min-h-screen flex flex-col items-center pt-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Overlap</h1>
        <div className="mb-6">
          <DateNav
            selectedDate={selectedDate}
            isOnToday={isOnToday}
            onPrevDay={goToPrevDay}
            onNextDay={goToNextDay}
            onToday={goToToday}
            onDateSelect={goToDate}
          />
        </div>
        <ZoneList
          zones={zones}
          homeZone={homeZone}
          onRemove={removeZone}
          onPinClick={handlePinClick}
          pinnedDate={pinnedDate}
          sourceZone={sourceZone}
          selectedDate={selectedDate}
        />
        <OverlapPanel
          zones={zones}
          homeZone={homeZone}
          date={selectedDate}
        />
        <div className="mt-4 text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground font-mono text-xs">⌘K</kbd> to add a zone
        </div>
        <CommandPalette onAdd={addZone} />
        <Toaster />
      </div>
      {pickerZone && (
        <TimePickerDialog
          open={!!pickerZone}
          onOpenChange={(open) => !open && setPickerZone(null)}
          timeZone={pickerZone}
          onPin={pinTime}
        />
      )}
    </div>
  )
}

export default App
