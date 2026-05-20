import { supabase } from './supabase'
import { normalizeItems } from './normalizeItem'
import { normalizeCategories } from './normalizeCategory'
import type { CategoryDisplay } from './normalizeCategory'
import type { MenuItem } from '../types/database'

export type MenuData = {
  categories: CategoryDisplay[]
  items: MenuItem[]
}

/** Fetch categories and items once each; items are normalized and deduplicated. */
export async function fetchMenuData(): Promise<MenuData> {
  const [catRes, itemRes] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabase
      .from('items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
  ])

  if (catRes.error) throw new Error(catRes.error.message)
  if (itemRes.error) throw new Error(itemRes.error.message)

  const items = normalizeItems(itemRes.data ?? [])

  return {
    categories: normalizeCategories(catRes.data ?? []),
    items,
  }
}
