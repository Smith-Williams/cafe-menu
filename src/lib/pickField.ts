/** Pick the first non-empty string from a row by known keys, then by key name heuristics. */
export function pickString(
  row: Record<string, unknown>,
  keys: string[],
  fallback = ''
): string {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  for (const [key, value] of Object.entries(row)) {
    if (typeof value !== 'string' || !value.trim()) continue
    const lower = key.toLowerCase()
    if (
      lower.includes('name') ||
      lower === 'title' ||
      lower === 'label' ||
      lower === 'caption'
    ) {
      return value.trim()
    }
  }

  return fallback
}
