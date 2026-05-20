import type { MenuItem } from '../types/database'
import { itemFingerprint } from './itemFingerprint'
import { pickString } from './pickField'

function pickImageUrl(row: Record<string, unknown>): string | null {
  const keys = [
    'image_url',
    'imageUrl',
    'image',
    'photo_url',
    'photo',
    'thumbnail_url',
    'thumbnail',
    'picture',
    'img',
  ]
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim()) {
      const url = value.trim()
      if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) {
        return url
      }
    }
  }
  return null
}

/** Map Supabase `items` rows to app shape. */
export function normalizeItem(row: Record<string, unknown>): MenuItem {
  const name = pickString(
    row,
    ['name_ar', 'name', 'title', 'item_name', 'product_name'],
    ''
  )
  const descText = pickString(
    row,
    ['description_ar', 'description', 'desc', 'details', 'summary'],
    ''
  )

  return {
    id: String(row.id ?? '').trim(),
    category_id: String(row.category_id ?? '').trim(),
    name_ar: String(name).trim(),
    description_ar: descText || null,
    price: Number(row.price),
    image_url: pickImageUrl(row),
    available: row.available !== false,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? new Date().toISOString()),
  }
}

/**
 * Keep exactly one row per product.
 * Skips duplicates that share the same id OR the same name+category+price.
 */
export function dedupeItems(items: MenuItem[]): MenuItem[] {
  const sorted = [...items].sort(
    (a, b) =>
      a.sort_order - b.sort_order ||
      a.name_ar.localeCompare(b.name_ar, 'ar') ||
      a.id.localeCompare(b.id)
  )

  const seenIds = new Set<string>()
  const seenFingerprints = new Set<string>()
  const result: MenuItem[] = []

  for (const item of sorted) {
    const id = item.id.trim()
    const fp = itemFingerprint(item)

    if (seenFingerprints.has(fp)) continue
    if (id && seenIds.has(id)) continue

    if (id) seenIds.add(id)
    seenFingerprints.add(fp)
    result.push(item)
  }

  return result
}

export function normalizeItems(rows: unknown[]): MenuItem[] {
  const normalized = rows.map((row) =>
    normalizeItem(row as Record<string, unknown>)
  )
  return dedupeItems(normalized)
}
