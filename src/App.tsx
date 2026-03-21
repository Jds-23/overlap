import { Toaster } from '@/components/ui/sonner'
import { ZoneList } from '@/components/zone-list'
import { CommandPalette } from '@/components/command-palette'
import { useZones } from '@/hooks/use-zones'

function App() {
  const { zones, homeZone, addZone, removeZone } = useZones()

  return (
    <div className="min-h-screen flex flex-col items-center pt-12">
      <h1 className="text-4xl font-bold text-primary mb-8">Overlap</h1>
      <ZoneList
        zones={zones}
        homeZone={homeZone}
        onRemove={removeZone}
      />
      <div className="mt-4 text-xs text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground font-mono text-xs">⌘K</kbd> to add a zone
      </div>
      <CommandPalette onAdd={addZone} />
      <Toaster />
    </div>
  )
}

export default App
