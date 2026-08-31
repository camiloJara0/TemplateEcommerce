export function isNetworkError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const candidate = error as { statusCode?: unknown, response?: unknown }
  return candidate.statusCode == null && candidate.response == null
}
