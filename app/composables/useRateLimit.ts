const map = new Map<string, number>()

export function useRateLimit() {
  function canCall(key: string, cooldownMs = 1000): boolean {
    const last = map.get(key) ?? 0
    const now = Date.now()
    if (now - last < cooldownMs) return false
    map.set(key, now)
    return true
  }

  function reset(key: string) {
    map.delete(key)
  }

  return { canCall, reset }
}
