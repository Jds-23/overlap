import { Toaster } from '@/components/ui/sonner'
import { ZoneList } from '@/components/zone-list'
import { useZones } from '@/hooks/use-zones'

function App() {
  const { zones, homeZone, addZone, removeZone } = useZones()

  return (
    <div className="min-h-screen flex flex-col items-center pt-12">
      <h1 className="text-4xl font-bold text-primary mb-8">Overlap</h1>
      <ZoneList
        zones={zones}
        homeZone={homeZone}
        onAdd={addZone}
        onRemove={removeZone}
      />
      <Toaster />
    </div>
  )
}

export default App
