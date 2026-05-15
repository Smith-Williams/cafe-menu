import type { MenuItem } from '../types/database'

/** Map Supabase `items` rows (name/name_ar, description/description_ar, etc.) to app shape. */
export function normalizeItem(row: Record<string, unknown>): MenuItem {
  const name =
    row.name_ar ?? row.name ?? row.title ?? row.item_name ?? ''
  const description =
    row.description_ar ?? row.description ?? row.desc ?? null

  return {
    id: String(row.id),
    category_id: String(row.category_id),
    name_ar: String(name).trim(),
    description_ar:
      description == null || description === ''
        ? null
        : String(description).trim(),
    price: Number(row.price),
    image_url:
      row.image_url != null && row.image_url !== ''
        ? String(row.image_url)
        : null,
    available: row.available !== false,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? new Date().toISOString()),
  }
}

export function normalizeItems(rows: unknown[]): MenuItem[] {
  return rows.map((row) => normalizeItem(row as Record<string, unknown>))
}
