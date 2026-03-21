import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { shouldShowInstallBanner } from '@/lib/visits'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallBanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!shouldShowInstallBanner()) return

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // If no beforeinstallprompt fires (e.g. already installable or unsupported),
    // still show the banner as a hint after a short delay
    const timer = setTimeout(() => {
      if (!deferredPrompt) setShow(true)
    }, 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [deferredPrompt])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
    }
    setShow(false)
  }

  const handleDismiss = () => {
    setDismissed(true)
    setShow(false)
  }

  if (!show || dismissed) return null

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-secondary border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 max-w-sm"
      data-testid="install-banner"
    >
      <Download className="w-5 h-5 text-primary shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Install Overlap</p>
        <p className="text-xs text-muted-foreground">
          Add to your home screen for quick access
        </p>
      </div>
      {deferredPrompt && (
        <Button size="sm" onClick={handleInstall} className="shrink-0">
          Install
        </Button>
      )}
      <button
        onClick={handleDismiss}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Dismiss install banner"
        data-testid="dismiss-install"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
