import type { MenuItem } from '../types/database'
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
    id: String(row.id ?? ''),
    category_id: String(row.category_id ?? ''),
    name_ar: String(name).trim(),
    description_ar: descText || null,
    price: Number(row.price),
    image_url: pickImageUrl(row),
    available: row.available !== false,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? new Date().toISOString()),
  }
}

/** Remove duplicate rows (same id, or same name+category+price). */
export function dedupeItems(items: MenuItem[]): MenuItem[] {
  const byId = new Map<string, MenuItem>()
  const seen = new Set<string>()

  const sorted = [...items].sort(
    (a, b) => a.sort_order - b.sort_order || a.name_ar.localeCompare(b.name_ar, 'ar')
  )

  for (const item of sorted) {
    const fingerprint = `${item.category_id}::${item.name_ar.toLowerCase()}::${item.price}`

    if (item.id) {
      if (byId.has(item.id)) continue
      byId.set(item.id, item)
      seen.add(fingerprint)
      continue
    }

    if (seen.has(fingerprint)) continue
    seen.add(fingerprint)
    byId.set(`fp-${fingerprint}`, item)
  }

  return Array.from(byId.values())
}

export function normalizeItems(rows: unknown[]): MenuItem[] {
  const normalized = rows.map((row) =>
    normalizeItem(row as Record<string, unknown>)
  )
  return dedupeItems(normalized)
}
