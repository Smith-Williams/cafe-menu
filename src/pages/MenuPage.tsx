import { useEffect, useMemo, useState } from 'react'
import type { MenuItem } from '../types/database'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { EVA_BRAND } from '../lib/brand'
import { buildCategoryTabs } from '../lib/categoryIcons'
import { formatMoney } from '../lib/format'
import { fetchMenuData } from '../lib/fetchMenu'
import { itemReactKey } from '../lib/itemFingerprint'
import type { CategoryDisplay } from '../lib/normalizeCategory'
import { AddToCartButton } from '../components/AddToCartButton'
import { CategoryTabs } from '../components/CategoryTabs'
import { MenuItemImage } from '../components/MenuItemImage'

function MenuSkeleton() {
  return (
    <div className="menu-grid" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="menu-card menu-card--skeleton">
          <div className="skeleton-shimmer menu-card-image" />
          <div className="menu-card-body">
            <div className="skeleton-shimmer skeleton-line skeleton-line--title" />
            <div className="skeleton-shimmer skeleton-line" />
            <div className="skeleton-shimmer skeleton-line skeleton-line--short" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MenuPage() {
  const { addItem } = useCart()
  const { settings } = useSettings()
  const [categories, setCategories] = useState<CategoryDisplay[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string | 'all'>('all')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchMenuData()
        if (cancelled) return
        setCategories(data.categories)
        setItems(data.items)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'تعذّر تحميل القائمة')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const tabs = useMemo(() => buildCategoryTabs(categories), [categories])

  const visibleItems = useMemo(() => {
    const base = items.filter((i) => i.available)
    if (activeCategoryId === 'all') return base
    return base.filter((i) => i.category_id === activeCategoryId)
  }, [items, activeCategoryId])

  const currency = settings.currency_code

  return (
    <>
      <section className="page-hero page-hero--menu">
        <p className="page-hero__eyebrow">{EVA_BRAND.nameEn}</p>
        <h1 className="page-hero__title-compact">{EVA_BRAND.nameAr}</h1>
        <p className="page-hero__tagline-en">{EVA_BRAND.taglineEn}</p>
      </section>

      {error ? (
        <div className="error-banner" role="alert">
          تعذّر تحميل القائمة: {error}
        </div>
      ) : null}

      {loading ? (
        <>
          <div className="category-strip category-strip--skeleton">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer skeleton-tab-pill" />
            ))}
          </div>
          <MenuSkeleton />
        </>
      ) : (
        <>
          <CategoryTabs
            tabs={tabs}
            activeId={activeCategoryId}
            onChange={setActiveCategoryId}
          />

          {visibleItems.length === 0 ? (
            <div className="panel empty-state">
              لا توجد عناصر في هذه الفئة حالياً.
            </div>
          ) : (
            <div className="menu-grid" key={activeCategoryId}>
              {visibleItems.map((item, index) => (
                <article
                  key={itemReactKey(item)}
                  className="menu-card menu-card--premium"
                  style={{ animationDelay: `${Math.min(index * 0.04, 0.28)}s` }}
                >
                  <div className="menu-card__accent" aria-hidden />
                  <MenuItemImage
                    src={item.image_url}
                    alt={item.name_ar || 'صورة المنتج'}
                  />
                  <div className="menu-card-body">
                    <h3 className="menu-card-title">
                      {item.name_ar || 'عنصر بدون اسم'}
                    </h3>
                    {item.description_ar ? (
                      <p className="desc">{item.description_ar}</p>
                    ) : null}
                    <div className="menu-card-footer">
                      <span className="price">
                        {formatMoney(Number(item.price), currency)}
                      </span>
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
