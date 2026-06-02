import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
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

const FEATURE_CARDS = [
  {
    icon: '☕',
    title: 'قهوة مختصة يوميا',
    text: 'تحميص دقيق ونكهات متوازنة لتجربة فاخرة في كل كوب.',
  },
  {
    icon: '✦',
    title: 'حبوب مختارة بعناية',
    text: 'ننتقي أفضل المحاصيل لضمان جودة ثابتة وطعم غني.',
  },
  {
    icon: '◌',
    title: 'راحة وأناقة',
    text: 'تصميم دافئ ومريح يمنحك تجربة مقهى راقية.',
  },
  {
    icon: '⌁',
    title: 'خدمة سريعة',
    text: 'طلباتك جاهزة بسرعة مع اهتمام كبير بأدق التفاصيل.',
  },
] as const

export function MenuPage() {
  const { addItem } = useCart()
  const { settings } = useSettings()
  const [categories, setCategories] = useState<CategoryDisplay[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string | 'all'>('all')
  const [contactSent, setContactSent] = useState(false)
  const menuSectionRef = useRef<HTMLElement>(null)

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

  function scrollToMenu() {
    menuSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function submitContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setContactSent(true)
    e.currentTarget.reset()
    window.setTimeout(() => setContactSent(false), 3500)
  }

  return (
    <>
      <section className="lux-hero">
        <div className="lux-hero__content">
          <p className="lux-hero__eyebrow">{EVA_BRAND.nameEn}</p>
          <h1>COFFEE & GO</h1>
          <p className="lux-hero__subtitle">
            أجواء فاخرة داكنة، قهوة متقنة، ونكهات تبقى في الذاكرة.
          </p>
          <button type="button" className="btn btn-primary btn-lg" onClick={scrollToMenu}>
            شاهد القائمة
          </button>
        </div>
        <div className="lux-hero__image" aria-hidden />
      </section>

      {error ? (
        <div className="error-banner" role="alert">
          تعذّر تحميل القائمة: {error}
        </div>
      ) : null}

      <section className="feature-grid">
        {FEATURE_CARDS.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <div className="feature-card__icon" aria-hidden>
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section ref={menuSectionRef} className="menu-showcase">
        <div className="menu-showcase__head">
          <h2>منيو يدفّي المزاج</h2>
          <p>صور كبيرة، تفاصيل واضحة، وتجربة طلب سريعة.</p>
        </div>

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

      </section>

      <footer className="lux-footer panel">
        <div className="lux-footer__info">
          <h2>بانتظار زيارتكم</h2>
          <p>يوميا من 7:30 صباحا وحتى 11:00 مساء</p>
          <p dir="ltr">+966 50 000 0000</p>
          <p>شارع القهوة - الرياض</p>
        </div>
        <form className="lux-footer__form" onSubmit={submitContact}>
          <h3>تواصل معنا</h3>
          {contactSent ? (
            <div className="success-banner" role="status">
              تم إرسال رسالتك بنجاح.
            </div>
          ) : null}
          <input type="text" placeholder="الاسم" required />
          <input type="tel" placeholder="رقم الجوال" required />
          <textarea placeholder="رسالتك" required />
          <button type="submit" className="btn btn-primary">
            إرسال
          </button>
        </form>
      </footer>
    </>
  )
}
