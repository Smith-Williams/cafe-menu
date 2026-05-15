import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { formatMoney } from '../lib/format'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { lines, subtotal, clear } = useCart()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (lines.length === 0) {
      setError('السلة فارغة.')
      return
    }
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()
    if (!trimmedName || !trimmedPhone) {
      setError('يرجى إدخال الاسم ورقم الجوال.')
      return
    }

    setSubmitting(true)

    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_name: trimmedName,
        customer_phone: trimmedPhone,
        notes: notes.trim() || null,
        total_amount: subtotal,
        status: 'pending',
      })
      .select('id')
      .single()

    if (orderErr || !orderRow) {
      setSubmitting(false)
      setError(orderErr?.message ?? 'تعذّر إنشاء الطلب.')
      return
    }

    const orderId = orderRow.id

    const inserts = lines.map((line) => ({
      order_id: orderId,
      menu_item_id: line.menuItem.id,
      quantity: line.quantity,
      unit_price: Number(line.menuItem.price),
      item_name_ar: line.menuItem.name_ar,
    }))

    const summaryLines = lines.map((l) => ({
      name: l.menuItem.name_ar,
      qty: l.quantity,
      lineTotal: Number(l.menuItem.price) * l.quantity,
    }))

    const { error: itemsErr } = await supabase.from('order_items').insert(inserts)

    if (itemsErr) {
      setSubmitting(false)
      setError(itemsErr.message)
      return
    }

    setSubmitting(false)
    navigate(`/order/${orderId}`, {
      replace: true,
      state: {
        customerName: trimmedName,
        phone: trimmedPhone,
        total: subtotal,
        lines: summaryLines,
      },
    })
    clear()
  }

  if (lines.length === 0) {
    return (
      <>
        <section className="hero">
          <h1>إتمام الطلب</h1>
          <p>لا توجد عناصر للطلب.</p>
        </section>
        <div className="panel empty-state">
          <Link to="/" className="btn btn-primary">
            العودة إلى القائمة
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>إتمام الطلب</h1>
        <p>أدخل بياناتك لتأكيد الطلب. لن نشارك معلوماتك مع أطراف خارجية.</p>
      </section>

      <div className="panel">
        <h2>بيانات العميل</h2>

        {error ? (
          <div className="error-banner" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            الاسم الكامل
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label>
            رقم الجوال
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </label>
          <label>
            ملاحظات (اختياري)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: بدون سكر، تناول في المقهى…"
            />
          </label>

          <div className="confirm-summary">
            <strong>ملخص الطلب</strong>
            <ul>
              {lines.map((l) => (
                <li key={l.menuItem.id}>
                  <span>
                    {l.menuItem.name_ar} × {l.quantity}
                  </span>
                  <span>
                    {formatMoney(Number(l.menuItem.price) * l.quantity)}
                  </span>
                </li>
              ))}
              <li style={{ marginTop: '0.5rem', fontWeight: 700 }}>
                <span>الإجمالي</span>
                <span>{formatMoney(subtotal)}</span>
              </li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'جاري الإرسال…' : 'تأكيد الطلب'}
            </button>
            <Link to="/cart" className="btn btn-ghost">
              العودة للسلة
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
