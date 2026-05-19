import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Category, MenuItem } from '../../types/database'
import { useAuth } from '../../context/AuthContext'
import { formatMoney } from '../../lib/format'
import { getCategoryLabel, normalizeCategories } from '../../lib/normalizeCategory'
import { normalizeItems } from '../../lib/normalizeItem'
import {
  mergeOrdersWithItems,
  type OrderWithItems,
} from '../../lib/normalizeOrder'

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

export function AdminDashboard() {
  const { signOut } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ordersWarning, setOrdersWarning] = useState<string | null>(null)

  const [categoryModal, setCategoryModal] = useState(false)
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(emptyCategory)

  const [itemModal, setItemModal] = useState(false)
  const [itemDraft, setItemDraft] = useState<ItemDraft>(emptyItem(''))

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setOrdersWarning(null)

    const [cRes, iRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('items').select('*').order('sort_order', { ascending: true }),
    ])

    if (cRes.error) {
      setError(cRes.error.message)
      setLoading(false)
      return
    }
    if (iRes.error) {
      setError(iRes.error.message)
      setLoading(false)
      return
    }

    setCategories(normalizeCategories(cRes.data ?? []))
    setItems(normalizeItems(iRes.data ?? []))

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
      if (err) setError(err.message)
    } else {
      const { error: err } = await supabase.from('items').insert(payload)
      if (err) setError(err.message)
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

  const itemsByCategory = (catId: string) =>
    items.filter((i) => i.category_id === catId)

  return (
    <>
      <section className="hero">
        <h1>لوحة المالك</h1>
        <p>إدارة الفئات والعناصر والطلبات الواردة من الزبائن.</p>
      </section>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
          تسجيل الخروج
        </button>
        <Link to="/" className="btn btn-primary">
          عرض القائمة للزبائن
        </Link>
      </div>

      {error ? (
        <div className="error-banner" role="alert">
          {error}
        </div>
      ) : null}

      {ordersWarning ? (
        <div className="error-banner" role="alert" style={{ marginBottom: '1rem' }}>
          تعذّر تحميل تفاصيل الطلبات: {ordersWarning}. تأكد من جداول orders و order_items
          وصلاحيات المالك.
        </div>
      ) : null}

      {loading ? (
        <p className="loading-inline">جاري التحميل…</p>
      ) : (
        <>
          <section className="admin-section panel">
            <header>
              <h2>الطلبات</h2>
              <span className="orders-count">{orders.length} طلب</span>
            </header>

            {orders.length === 0 ? (
              <p className="loading-inline">لا توجد طلبات بعد.</p>
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
                          {order.status === 'pending' ? 'قيد الانتظار' : order.status}
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
                              {formatMoney(line.unit_price * line.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="loading-inline" style={{ margin: '0.5rem 0 0' }}>
                        لا تفاصيل عناصر لهذا الطلب.
                      </p>
                    )}

                    {order.notes ? (
                      <p className="order-card__notes">
                        <strong>ملاحظات:</strong> {order.notes}
                      </p>
                    ) : null}

                    <div className="order-card__total">
                      <span>الإجمالي</span>
                      <span className="price">{formatMoney(order.total_amount)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="admin-section panel">
            <header>
              <h2>الفئات</h2>
              <button type="button" className="btn btn-primary" onClick={openNewCategory}>
                إضافة فئة
              </button>
            </header>

            {categories.length === 0 ? (
              <p className="loading-inline">لا توجد فئات بعد. أنشئ فئة ثم أضف عناصر.</p>
            ) : (
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
                          className="btn btn-ghost"
                          style={{ fontSize: '0.85rem', padding: '0.35rem 0.6rem' }}
                          onClick={() => openEditCategory(c)}
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ fontSize: '0.85rem', padding: '0.35rem 0.6rem' }}
                          onClick={() => void deleteCategory(c.id)}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="admin-section panel">
            <header>
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

            {categories.map((c) => (
              <div key={c.id} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>{getCategoryLabel(c)}</h3>
                {itemsByCategory(c.id).length === 0 ? (
                  <p className="loading-inline" style={{ margin: '0.25rem 0 0' }}>
                    لا عناصر في هذه الفئة.
                  </p>
                ) : (
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
                          <td>{formatMoney(Number(row.price))}</td>
                          <td>{row.available ? 'نعم' : 'لا'}</td>
                          <td className="row-actions">
                            <button
                              type="button"
                              className="btn btn-ghost"
                              style={{ fontSize: '0.85rem', padding: '0.35rem 0.6rem' }}
                              onClick={() => openEditItem(row)}
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ fontSize: '0.85rem', padding: '0.35rem 0.6rem' }}
                              onClick={() => void deleteItem(row.id)}
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </section>
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
                <button type="button" className="btn btn-ghost" onClick={() => setCategoryModal(false)}>
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
                السعر (رقم فقط)
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
                رابط الصورة (image_url)
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
                    alt="معاينة الصورة"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              ) : null}
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
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
    </>
  )
}
