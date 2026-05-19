import type { Category } from '../types/database'
import { pickString } from './pickField'

export type CategoryDisplay = Category & {
  icon?: string | null
}

/** Map Supabase `categories` rows to app shape (name vs name_ar, etc.). */
export function normalizeCategory(row: Record<string, unknown>): CategoryDisplay {
  const name = pickString(
    row,
    [
      'name_ar',
      'name',
      'name_arabic',
      'arabic_name',
      'title',
      'label',
      'category_name',
      'display_name',
      'slug',
    ],
    ''
  )

  const icon =
    typeof row.icon === 'string'
      ? row.icon
      : typeof row.emoji === 'string'
        ? row.emoji
        : typeof row.image_url === 'string' && row.image_url.length <= 4
          ? row.image_url
          : null

  return {
    id: String(row.id),
    name_ar: name || (icon ? '' : 'فئة بدون اسم'),
    sort_order: Number(row.sort_order ?? row.order ?? row.position ?? 0),
    created_at: String(row.created_at ?? new Date().toISOString()),
    icon,
  }
}

export function getCategoryLabel(category: CategoryDisplay): string {
  if (category.name_ar) return category.name_ar
  if (category.icon) return category.icon
  return 'فئة'
}

export function normalizeCategories(rows: unknown[]): CategoryDisplay[] {
  return rows.map((row) => normalizeCategory(row as Record<string, unknown>))
}
