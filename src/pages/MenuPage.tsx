import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { MenuItem } from '../types/database'
import { useCart } from '../context/CartContext'
import { formatMoney } from '../lib/format'
import { normalizeItems } from '../lib/normalizeItem'
import {
  getCategoryLabel,
  normalizeCategories,
  type CategoryDisplay,
} from '../lib/normalizeCategory'
import { AddToCartButton } from '../components/AddToCartButton'

export function MenuPage() {
  const { addItem } = useCart()
  const [categories, setCategories] = useState<CategoryDisplay[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string | 'all'>(
    'all'
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const [catRes, itemRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('items').select('*').order('sort_order', { ascending: true }),
      ])

      if (cancelled) return

      if (catRes.error) {
        setError(catRes.error.message)
        setLoading(false)
        return
      }
      if (itemRes.error) {
        setError(itemRes.error.message)
        setLoading(false)
        return
      }

      setCategories(normalizeCategories(catRes.data ?? []))
      setItems(normalizeItems(itemRes.data ?? []))
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const visibleItems = useMemo(() => {
    const base = items.filter((i) => i.available)
    if (activeCategoryId === 'all') return base
    return base.filter((i) => i.category_id === activeCategoryId)
  }, [items, activeCategoryId])

  return (
    <>
      <section className="hero">
        <h1>استمتع بأفضل قهوة ومخبوزات اليوم</h1>
        <p>اختر الفئة ثم أضف ما يعجبك إلى السلة — تصميم هادئ بخط عربي واضح.</p>
      </section>

      {error ? (
        <div className="error-banner" role="alert">
          تعذّر تحميل القائمة: {error}. تأكد من تشغيل SQL في Supabase وأن المفاتيح في
          ملف ‎.env‎ صحيحة.
        </div>
      ) : null}

      {loading ? (
        <p className="loading-inline">جاري تحميل القائمة…</p>
      ) : (
        <>
          <div className="category-tabs" role="tablist" aria-label="فئات القائمة">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategoryId === 'all'}
              className={`tab ${activeCategoryId === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategoryId('all')}
            >
              الكل
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={activeCategoryId === c.id}
                className={`tab ${activeCategoryId === c.id ? 'active' : ''}`}
                onClick={() => setActiveCategoryId(c.id)}
              >
                <span className="tab__label">{getCategoryLabel(c)}</span>
              </button>
            ))}
          </div>

          {visibleItems.length === 0 ? (
            <div className="panel empty-state">
              لا توجد عناصر في هذه الفئة حالياً.
            </div>
          ) : (
            <div className="menu-grid">
              {visibleItems.map((item) => (
                <article key={item.id} className="menu-card">
                  <div className="menu-card-image">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" loading="lazy" />
                    ) : (
                      <span aria-hidden>☕</span>
                    )}
                  </div>
                  <div className="menu-card-body">
                    <h3 className="menu-card-title">
                      {item.name_ar || 'عنصر بدون اسم'}
                    </h3>
                    {item.description_ar ? (
                      <p className="desc">{item.description_ar}</p>
                    ) : null}
                    <div className="menu-card-footer">
                      <span className="price">{formatMoney(Number(item.price))}</span>
                      <AddToCartButton item={item} onAdd={addItem} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
