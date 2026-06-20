import { supabase } from './supabase'

function missingColumn(err: { message?: string }, col: string): boolean {
  const m = err.message?.toLowerCase() ?? ''
  return m.includes(col.toLowerCase()) && (m.includes('column') || m.includes('schema'))
}

/** Insert/update category — works with name+emoji or name_ar+icon schemas */
export async function writeCategory(
  payload: {
    name_ar: string
    icon: string | null
    sort_order: number
  },
  id?: string
): Promise<{ error: string | null }> {
  const label = payload.name_ar
  const icon = payload.icon
  const sort = payload.sort_order

  const full = {
    name_ar: label,
    name: label,
    icon,
    emoji: icon,
    sort_order: sort,
  }
  const minimal = {
    name_ar: label,
    icon,
    sort_order: sort,
  }
  const legacy = {
    name: label,
    emoji: icon,
    sort_order: sort,
  }

  const attempts = id
    ? [
        () => supabase.from('categories').update(full).eq('id', id),
        () => supabase.from('categories').update(minimal).eq('id', id),
        () => supabase.from('categories').update(legacy).eq('id', id),
      ]
    : [
        () => supabase.from('categories').insert(full),
        () => supabase.from('categories').insert(minimal),
        () => supabase.from('categories').insert(legacy),
      ]

  for (const attempt of attempts) {
    const { error } = await attempt()
    if (!error) return { error: null }
    if (
      !missingColumn(error, 'name') &&
      !missingColumn(error, 'name_ar') &&
      !missingColumn(error, 'icon') &&
      !missingColumn(error, 'emoji')
    ) {
      return { error: error.message }
    }
  }

  return { error: 'تعذّر حفظ الفئة — تحقق من أعمدة جدول categories' }
}

/** Insert/update menu item — fills name when DB requires it */
export async function writeMenuItem(
  payload: {
    category_id: string
    name_ar: string
    description_ar: string | null
    price: number
    image_url: string | null
    available: boolean
    sort_order: number
  },
  id?: string
): Promise<{ error: string | null }> {
  const label = payload.name_ar
  const full = { ...payload, name: label }
  const minimal = { ...payload }

  const attempts = id
    ? [
        () => supabase.from('items').update(full).eq('id', id),
        () => supabase.from('items').update(minimal).eq('id', id),
      ]
    : [
        () => supabase.from('items').insert(full),
        () => supabase.from('items').insert(minimal),
      ]

  for (const attempt of attempts) {
    const { error } = await attempt()
    if (!error) return { error: null }
    if (!missingColumn(error, 'name') && !missingColumn(error, 'name_ar')) {
      return { error: error.message }
    }
  }

  return { error: 'تعذّر حفظ العنصر' }
}
