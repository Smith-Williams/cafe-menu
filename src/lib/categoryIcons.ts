import type { CategoryDisplay } from './normalizeCategory'

export type CategoryTab = {
  id: string | 'all'
  labelAr: string
  labelEn: string
  icon: string
}

export const ALL_TAB: CategoryTab = {
  id: 'all',
  labelAr: 'الكل',
  labelEn: 'All',
  icon: '✦',
}

/** Resolve display icon: DB column → name heuristics → default */
export function getCategoryIcon(category: CategoryDisplay): string {
  if (category.icon?.trim()) return category.icon.trim()

  const name = category.name_ar.toLowerCase()
  if (/ساخن|hot|قهوة|espresso|coffee/.test(name)) return '☕'
  if (/بارد|cold|آيس|ice|مثلج/.test(name)) return '🧊'
  if (/طعام|food|مخبوز|حلو|ساندو|وجبات|معجنات/.test(name)) return '🥐'
  return '◆'
}

export function categoryToTab(category: CategoryDisplay): CategoryTab {
  const icon = getCategoryIcon(category)
  const labelAr = category.name_ar || 'فئة'

  let labelEn = 'Menu'
  const n = labelAr.toLowerCase()
  if (/ساخن|hot/.test(n)) labelEn = 'Hot Drinks'
  else if (/بارد|cold/.test(n)) labelEn = 'Cold Drinks'
  else if (/طعام|food|مخبوز/.test(n)) labelEn = 'Food'

  return { id: category.id, labelAr, labelEn, icon }
}

export function buildCategoryTabs(categories: CategoryDisplay[]): CategoryTab[] {
  return [ALL_TAB, ...categories.map(categoryToTab)]
}
