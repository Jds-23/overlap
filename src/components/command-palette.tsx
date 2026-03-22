import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { searchTimezones } from '@/lib/tz-search'
import { getCityName, getUtcOffset } from '@/lib/timezone'

interface CommandPaletteProps {
  onAdd: (tz: string) => { ok: boolean; error?: string }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ onAdd, open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  const handleSelect = useCallback(
    (tz: string) => {
      const result = onAdd(tz)
      if (result.ok) {
        onOpenChange(false)
        setQuery('')
      } else if (result.error) {
        toast.error(result.error)
      }
    },
    [onAdd],
  )

  const results = searchTimezones(query)

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Time Zone"
      description="Search for a city or timezone abbreviation"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search city or abbreviation (e.g. Tokyo, PT, IST)..."
          value={query}
          onValueChange={setQuery}
          data-testid="command-input"
        />
        <CommandList>
          <CommandEmpty>No timezone found.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Timezones">
              {results.map((r) => (
                <CommandItem
                  key={r.timezone}
                  value={r.timezone}
                  onSelect={() => handleSelect(r.timezone)}
                  data-testid="command-result"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>
                      {r.matchType === 'alias'
                        ? r.label
                        : getCityName(r.timezone)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getUtcOffset(r.timezone)}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
