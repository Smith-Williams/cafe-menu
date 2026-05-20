import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Category, MenuItem, OrderStatus } from '../../types/database'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import { formatMoney } from '../../lib/format'
import { getCategoryLabel } from '../../lib/normalizeCategory'
import { fetchMenuData } from '../../lib/fetchMenu'
import {
  mergeOrdersWithItems,
  type OrderWithItems,
} from '../../lib/normalizeOrder'
import { ORDER_STATUSES, orderStatusLabel } from '../../lib/orderStatus'

type AdminTab = 'orders' | 'items' | 'categories' | 'settings'

type CategoryDraft = {
  id?: string
  name_ar: string
  sort_order: number
}

type ItemDraft = {
  id?: string
  category_id: string
  name_ar: string
  description_ar: string
  price: string
  image_url: string
  available: boolean
  sort_order: number
}

const emptyCategory: CategoryDraft = { name_ar: '', sort_order: 0 }

function emptyItem(categoryId: string): ItemDraft {
  return {
    category_id: categoryId,
    name_ar: '',
    description_ar: '',
    price: '',
    image_url: '',
    available: true,
    sort_order: 0,
  }
}

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'orders', label: 'الطلبات' },
  { id: 'items', label: 'عناصر القائمة' },
  { id: 'categories', label: 'الفئات' },
  { id: 'settings', label: 'إعدادات المقهى' },
]

export function AdminDashboard() {
  const { signOut } = useAuth()
  const { settings, updateSettings } = useSettings()
  const [tab, setTab] = useState<AdminTab>('orders')
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [ordersWarning, setOrdersWarning] = useState<string | null>(null)

  const [categoryModal, setCategoryModal] = useState(false)
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(emptyCategory)

  const [itemModal, setItemModal] = useState(false)
  const [itemDraft, setItemDraft] = useState<ItemDraft>(emptyItem(''))

  const [settingsDraft, setSettingsDraft] = useState({
    cafe_name_ar: settings.cafe_name_ar,
    tagline_ar: settings.tagline_ar ?? '',
    logo_url: settings.logo_url ?? '',
    primary_color: settings.primary_color,
    accent_color: settings.accent_color,
  })
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    setSettingsDraft({
      cafe_name_ar: settings.cafe_name_ar,
      tagline_ar: settings.tagline_ar ?? '',
      logo_url: settings.logo_url ?? '',
      primary_color: settings.primary_color,
      accent_color: settings.accent_color,
    })
  }, [settings])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setOrdersWarning(null)

    try {
      const menu = await fetchMenuData()
      setCategories(menu.categories)
      setItems(menu.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر تحميل القائمة')
      setLoading(false)
      return
    }

    let ordersData: unknown[] = []
    let orderLines: unknown[] = []

    const nestedRes = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (!nestedRes.error && nestedRes.data) {
      ordersData = nestedRes.data
    } else {
      const ordersRes = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersRes.error) {
        setOrdersWarning(ordersRes.error.message)
        setOrders([])
      } else {
        ordersData = ordersRes.data ?? []
        const ids = ordersData.map((o) => String((o as { id: string }).id))
        if (ids.length > 0) {
          const linesRes = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', ids)
          if (linesRes.error) {
            setOrdersWarning(linesRes.error.message)
          } else {
            orderLines = linesRes.data ?? []
          }
        }
      }
    }

    setOrders(mergeOrdersWithItems(ordersData, orderLines))
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    setError(null)
    const { error: err } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    if (err) {
      setError(err.message)
      return
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )
  }

  function openNewCategory() {
    setCategoryDraft(emptyCategory)
    setCategoryModal(true)
  }

  function openEditCategory(c: Category) {
    setCategoryDraft({
      id: c.id,
      name_ar: c.name_ar,
      sort_order: c.sort_order,
    })
    setCategoryModal(true)
  }

  async function saveCategory(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const payload = {
      name_ar: categoryDraft.name_ar.trim(),
      sort_order: Number(categoryDraft.sort_order) || 0,
    }
    if (!payload.name_ar) return

    if (categoryDraft.id) {
      const { error: err } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', categoryDraft.id)
      if (err) setError(err.message)
    } else {
      const { error: err } = await supabase.from('categories').insert(payload)
      if (err) setError(err.message)
    }
    setCategoryModal(false)
    void load()
  }

  async function deleteCategory(id: string) {
    if (!window.confirm('حذف الفئة سيحذف كل عناصرها. متابعة؟')) return
    setError(null)
    const { error: err } = await supabase.from('categories').delete().eq('id', id)
    if (err) setError(err.message)
    void load()
  }

  function openNewItem() {
    const first = categories[0]?.id ?? ''
    setItemDraft(emptyItem(first))
    setItemModal(true)
  }

  function openEditItem(row: MenuItem) {
    setItemDraft({
      id: row.id,
      category_id: row.category_id,
      name_ar: row.name_ar,
      description_ar: row.description_ar ?? '',
      price: String(row.price),
      image_url: row.image_url ?? '',
      available: row.available,
      sort_order: row.sort_order,
    })
    setItemModal(true)
  }

  async function saveItem(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const priceNum = Number(itemDraft.price)
    if (!itemDraft.name_ar.trim() || !itemDraft.category_id || Number.isNaN(priceNum)) {
      setError('يرجى تعبئة الاسم والفئة والسعر بشكل صحيح.')
      return
    }

    const payload = {
      category_id: itemDraft.category_id,
      name_ar: itemDraft.name_ar.trim(),
      description_ar: itemDraft.description_ar.trim() || null,
      price: priceNum,
      image_url: itemDraft.image_url.trim() || null,
      available: itemDraft.available,
      sort_order: Number(itemDraft.sort_order) || 0,
    }

    if (itemDraft.id) {
      const { error: err } = await supabase
        .from('items')
        .update(payload)
        .eq('id', itemDraft.id)
      if (err) {
        setError(
          err.message.includes('items_category_name_unique')
            ? 'يوجد عنصر بنفس الاسم في هذه الفئة. غيّر الاسم أو عدّل العنصر الموجود.'
            : err.message
        )
        return
      }
    } else {
      const { error: err } = await supabase.from('items').insert(payload)
      if (err) {
        setError(
          err.message.includes('items_category_name_unique')
            ? 'يوجد عنصر بنفس الاسم في هذه الفئة مسبقاً.'
            : err.message
        )
        return
      }
    }
    setItemModal(false)
    void load()
  }

  async function deleteItem(id: string) {
    if (!window.confirm('حذف هذا العنصر؟')) return
    setError(null)
    const { error: err } = await supabase.from('items').delete().eq('id', id)
    if (err) setError(err.message)
    void load()
  }

  async function saveSettingsForm(e: FormEvent) {
    e.preventDefault()
    setSavingSettings(true)
    setError(null)
    setSuccess(null)
    const { error: err } = await updateSettings({
      cafe_name_ar: settingsDraft.cafe_name_ar.trim() || settings.cafe_name_ar,
      tagline_ar: settingsDraft.tagline_ar.trim() || null,
      logo_url: settingsDraft.logo_url.trim() || null,
      primary_color: settingsDraft.primary_color.trim(),
      accent_color: settingsDraft.accent_color.trim(),
    })
    setSavingSettings(false)
    if (err) setError(err)
    else setSuccess('تم حفظ إعدادات المقهى.')
  }

  const itemsByCategory = (catId: string) =>
    items.filter((i) => i.category_id === catId)

  const currency = settings.currency_code

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <h1 className="admin-header__title">لوحة الإدارة</h1>
          <p className="admin-header__sub">إدارة الطلبات والقائمة ومظهر المقهى</p>
        </div>
        <div className="admin-header__actions">
          <Link to="/" className="btn btn-ghost">
            عرض القائمة
          </Link>
          <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
            خروج
          </button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="أقسام لوحة الإدارة">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === 'orders' && orders.length > 0 ? (
              <span className="admin-tab__badge">{orders.length}</span>
            ) : null}
          </button>
        ))}
      </nav>

      {error ? (
        <div className="error-banner" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="success-banner" role="status">
          {success}
        </div>
      ) : null}
      {ordersWarning ? (
        <div className="error-banner" role="alert">
          تعذّر تحميل تفاصيل الطلبات: {ordersWarning}
        </div>
      ) : null}

      {loading ? (
        <div className="skeleton-grid" aria-hidden>
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-block" />
          ))}
        </div>
      ) : (
        <>
          {tab === 'orders' ? (
            <section className="panel admin-panel">
              <header className="admin-panel__head">
                <h2>الطلبات الواردة</h2>
                <span className="orders-count">{orders.length} طلب</span>
              </header>

              {orders.length === 0 ? (
                <p className="empty-state">لا توجد طلبات بعد.</p>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <article key={order.id} className="order-card">
                      <div className="order-card__head">
                        <div>
                          <strong>{order.customer_name}</strong>
                          <span className="order-card__phone" dir="ltr">
                            {order.customer_phone}
                          </span>
                        </div>
                        <div className="order-card__meta">
                          <span className={`order-status order-status--${order.status}`}>
                            {orderStatusLabel(order.status)}
                          </span>
                          <time className="order-card__time">
                            {new Date(order.created_at).toLocaleString('ar-SA', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </time>
                        </div>
                      </div>

                      {order.items.length > 0 ? (
                        <ul className="order-card__items">
                          {order.items.map((line, idx) => (
                            <li key={`${order.id}-${idx}`}>
                              <span>
                                {line.item_name} × {line.quantity}
                              </span>
                              <span>
                                {formatMoney(line.unit_price * line.quantity, currency)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">لا تفاصيل عناصر لهذا الطلب.</p>
                      )}

                      {order.notes ? (
                        <p className="order-card__notes">
                          <strong>ملاحظات:</strong> {order.notes}
                        </p>
                      ) : null}

                      <div className="order-card__total">
                        <span>الإجمالي</span>
                        <span className="price">
                          {formatMoney(order.total_amount, currency)}
                        </span>
                      </div>

                      <div className="order-card__actions">
                        {ORDER_STATUSES.map((status) => (
                          <button
                            key={status}
                            type="button"
                            className={`btn btn-ghost btn-sm ${order.status === status ? 'active' : ''}`}
                            disabled={order.status === status}
                            onClick={() => void updateOrderStatus(order.id, status)}
                          >
                            {orderStatusLabel(status)}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {tab === 'categories' ? (
            <section className="panel admin-panel">
              <header className="admin-panel__head">
                <h2>فئات القائمة</h2>
                <button type="button" className="btn btn-primary" onClick={openNewCategory}>
                  إضافة فئة
                </button>
              </header>

              {categories.length === 0 ? (
                <p className="empty-state">لا توجد فئات. أنشئ فئة ثم أضف عناصر.</p>
              ) : (
                <div className="table-wrap">
                  <table className="table-like">
                    <thead>
                      <tr>
                        <th>الترتيب</th>
                        <th>الاسم</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id}>
                          <td>{c.sort_order}</td>
                          <td>{getCategoryLabel(c)}</td>
                          <td className="row-actions">
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => openEditCategory(c)}
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => void deleteCategory(c.id)}
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}

          {tab === 'items' ? (
            <section className="panel admin-panel">
              <header className="admin-panel__head">
                <h2>عناصر القائمة</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openNewItem}
                  disabled={categories.length === 0}
                >
                  إضافة عنصر
                </button>
              </header>

              <p className="text-muted admin-hint">
                كل عنصر يظهر مرة واحدة للزبائن. الأسماء المكررة في نفس الفئة تُمنع تلقائياً.
              </p>

              {categories.map((c) => (
                <div key={c.id} className="admin-category-block">
                  <h3 className="admin-category-block__title">{getCategoryLabel(c)}</h3>
                  {itemsByCategory(c.id).length === 0 ? (
                    <p className="text-muted">لا عناصر في هذه الفئة.</p>
                  ) : (
                    <div className="table-wrap">
                      <table className="table-like">
                        <thead>
                          <tr>
                            <th>الاسم</th>
                            <th>السعر</th>
                            <th>متاح</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {itemsByCategory(c.id).map((row) => (
                            <tr key={row.id}>
                              <td>{row.name_ar}</td>
                              <td>{formatMoney(Number(row.price), currency)}</td>
                              <td>
                                <span
                                  className={
                                    row.available ? 'badge badge--ok' : 'badge badge--off'
                                  }
                                >
                                  {row.available ? 'متاح' : 'مخفي'}
                                </span>
                              </td>
                              <td className="row-actions">
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => openEditItem(row)}
                                >
                                  تعديل
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => void deleteItem(row.id)}
                                >
                                  حذف
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </section>
          ) : null}

          {tab === 'settings' ? (
            <section className="panel admin-panel">
              <header className="admin-panel__head">
                <h2>إعدادات المقهى</h2>
              </header>

              <form onSubmit={saveSettingsForm} className="form-grid settings-form">
                <label>
                  اسم المقهى
                  <input
                    value={settingsDraft.cafe_name_ar}
                    onChange={(e) =>
                      setSettingsDraft((d) => ({ ...d, cafe_name_ar: e.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  الشعار (نص تحت الاسم)
                  <input
                    value={settingsDraft.tagline_ar}
                    onChange={(e) =>
                      setSettingsDraft((d) => ({ ...d, tagline_ar: e.target.value }))
                    }
                  />
                </label>
                <label>
                  رابط الشعار (صورة)
                  <input
                    type="url"
                    value={settingsDraft.logo_url}
                    onChange={(e) =>
                      setSettingsDraft((d) => ({ ...d, logo_url: e.target.value }))
                    }
                    placeholder="https://…"
                  />
                </label>
                {settingsDraft.logo_url.trim() ? (
                  <div className="brand-preview">
                    <img
                      src={settingsDraft.logo_url.trim()}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                ) : null}
                <div className="color-fields">
                  <label>
                    اللون الأساسي
                    <div className="color-input">
                      <input
                        type="color"
                        value={settingsDraft.primary_color}
                        onChange={(e) =>
                          setSettingsDraft((d) => ({
                            ...d,
                            primary_color: e.target.value,
                          }))
                        }
                      />
                      <input
                        value={settingsDraft.primary_color}
                        onChange={(e) =>
                          setSettingsDraft((d) => ({
                            ...d,
                            primary_color: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </label>
                  <label>
                    اللون الثانوي
                    <div className="color-input">
                      <input
                        type="color"
                        value={settingsDraft.accent_color}
                        onChange={(e) =>
                          setSettingsDraft((d) => ({
                            ...d,
                            accent_color: e.target.value,
                          }))
                        }
                      />
                      <input
                        value={settingsDraft.accent_color}
                        onChange={(e) =>
                          setSettingsDraft((d) => ({
                            ...d,
                            accent_color: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                  {savingSettings ? 'جاري الحفظ…' : 'حفظ الإعدادات'}
                </button>
              </form>
            </section>
          ) : null}
        </>
      )}

      {categoryModal ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setCategoryModal(false)}
        >
          <div className="modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{categoryDraft.id ? 'تعديل فئة' : 'فئة جديدة'}</h3>
            <form onSubmit={saveCategory} className="form-grid">
              <label>
                الاسم بالعربية
                <input
                  value={categoryDraft.name_ar}
                  onChange={(e) =>
                    setCategoryDraft((d) => ({ ...d, name_ar: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                ترتيب العرض
                <input
                  type="number"
                  value={categoryDraft.sort_order}
                  onChange={(e) =>
                    setCategoryDraft((d) => ({
                      ...d,
                      sort_order: Number(e.target.value),
                    }))
                  }
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setCategoryModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {itemModal ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setItemModal(false)}
        >
          <div className="modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{itemDraft.id ? 'تعديل عنصر' : 'عنصر جديد'}</h3>
            <form onSubmit={saveItem} className="form-grid">
              <label>
                الفئة
                <select
                  value={itemDraft.category_id}
                  onChange={(e) =>
                    setItemDraft((d) => ({ ...d, category_id: e.target.value }))
                  }
                  required
                >
                  <option value="">اختر…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getCategoryLabel(c)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                الاسم بالعربية
                <input
                  value={itemDraft.name_ar}
                  onChange={(e) =>
                    setItemDraft((d) => ({ ...d, name_ar: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                الوصف
                <textarea
                  value={itemDraft.description_ar}
                  onChange={(e) =>
                    setItemDraft((d) => ({ ...d, description_ar: e.target.value }))
                  }
                />
              </label>
              <label>
                السعر
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={itemDraft.price}
                  onChange={(e) =>
                    setItemDraft((d) => ({ ...d, price: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                رابط الصورة
                <input
                  type="url"
                  value={itemDraft.image_url}
                  onChange={(e) =>
                    setItemDraft((d) => ({ ...d, image_url: e.target.value }))
                  }
                  placeholder="https://example.com/photo.jpg"
                />
              </label>
              {itemDraft.image_url.trim() ? (
                <div className="image-preview">
                  <img
                    src={itemDraft.image_url.trim()}
                    alt="معاينة"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              ) : null}
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={itemDraft.available}
                  onChange={(e) =>
                    setItemDraft((d) => ({ ...d, available: e.target.checked }))
                  }
                />
                متاح للبيع
              </label>
              <label>
                ترتيب العرض
                <input
                  type="number"
                  value={itemDraft.sort_order}
                  onChange={(e) =>
                    setItemDraft((d) => ({
                      ...d,
                      sort_order: Number(e.target.value),
                    }))
                  }
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setItemModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
