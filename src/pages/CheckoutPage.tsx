import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { formatMoney } from '../lib/format'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { lines, subtotal, clear } = useCart()
  const { settings } = useSettings()
  const currency = settings.currency_code
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

    const p_lines = lines.map((line) => ({
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

    const { data: orderId, error: rpcErr } = await supabase.rpc(
      'create_order_with_items',
      {
        p_customer_name: trimmedName,
        p_customer_phone: trimmedPhone,
        p_notes: notes.trim() || null,
        p_total_amount: subtotal,
        p_lines: p_lines,
      }
    )

    if (rpcErr || !orderId) {
      setSubmitting(false)
      setError(
        rpcErr?.message ??
          'تعذّر إنشاء الطلب. تأكد من تشغيل ملف supabase/migrations/cafe_settings_and_improvements.sql'
      )
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
        <section className="page-hero page-hero--compact">
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
      <section className="page-hero page-hero--compact">
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
                    {formatMoney(Number(l.menuItem.price) * l.quantity, currency)}
                  </span>
                </li>
              ))}
              <li className="confirm-summary__total">
                <span>الإجمالي</span>
                <span>{formatMoney(subtotal, currency)}</span>
              </li>
            </ul>
          </div>

          <div className="form-actions">
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
