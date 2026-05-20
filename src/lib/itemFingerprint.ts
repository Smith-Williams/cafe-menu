import type { MenuItem } from '../types/database'

/** Normalize Arabic/Latin names for stable duplicate detection. */
export function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\s+/g, ' ')
}

/** Stable key for deduplicating menu rows (ignores differing UUIDs for same product). */
export function itemFingerprint(item: Pick<MenuItem, 'category_id' | 'name_ar' | 'price'>): string {
  const name = normalizeProductName(item.name_ar)
  const category = String(item.category_id).toLowerCase().trim()
  const price = Number.isFinite(Number(item.price))
    ? Number(item.price).toFixed(2)
    : '0.00'
  return `${category}|${name}|${price}`
}

export function itemReactKey(item: MenuItem): string {
  const id = item.id?.trim()
  if (id) return id
  return itemFingerprint(item)
}
