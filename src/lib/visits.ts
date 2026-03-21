const VISIT_KEY = 'overlap-visit-count'

export function getVisitCount(): number {
  try {
    return parseInt(localStorage.getItem(VISIT_KEY) ?? '0', 10)
  } catch {
    return 0
  }
}

export function incrementVisitCount(): number {
  const count = getVisitCount() + 1
  try {
    localStorage.setItem(VISIT_KEY, String(count))
  } catch { /* ignore */ }
  return count
}

export function shouldShowInstallBanner(): boolean {
  return getVisitCount() >= 2
}
