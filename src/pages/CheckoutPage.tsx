import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { EVA_BRAND } from '../lib/brand'
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
          'تعذّر إنشاء الطلب. تأكد من تشغيل migrations في Supabase.'
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
        <p className="page-hero__eyebrow">{EVA_BRAND.nameEn}</p>
        <h1>إتمام الطلب</h1>
        <p>خطوة أخيرة — أدخل بياناتك وسنُجهّز طلبك.</p>
      </section>

      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form panel">
          <h2 className="checkout-section-title">بيانات التوصيل</h2>

          {error ? (
            <div className="error-banner" role="alert">
              {error}
            </div>
          ) : null}

          <div className="form-grid">
            <label className="field">
              <span className="field__label">الاسم الكامل</span>
              <input
                type="text"
                className="field__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="مثال: أحمد محمد"
                required
              />
            </label>
            <label className="field">
              <span className="field__label">رقم الجوال</span>
              <input
                type="tel"
                className="field__input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="05xxxxxxxx"
                dir="ltr"
                required
              />
            </label>
            <label className="field field--full">
              <span className="field__label">ملاحظات (اختياري)</span>
              <textarea
                className="field__input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="بدون سكر، استلام من الفرع…"
                rows={3}
              />
            </label>
          </div>

          <div className="checkout-form__actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" aria-hidden />
                  جاري التأكيد…
                </>
              ) : (
                'تأكيد الطلب'
              )}
            </button>
            <Link to="/cart" className="btn btn-ghost">
              العودة للسلة
            </Link>
          </div>
        </form>

        <aside className="checkout-summary panel">
          <h2 className="checkout-section-title">ملخص الطلب</h2>
          <p className="checkout-summary__count">{lines.length} صنف</p>
          <ul className="checkout-summary__list">
            {lines.map((l) => (
              <li key={l.menuItem.id} className="checkout-summary__row">
                <div className="checkout-summary__name">
                  <span>{l.menuItem.name_ar}</span>
                  <span className="checkout-summary__qty">× {l.quantity}</span>
                </div>
                <span className="checkout-summary__price">
                  {formatMoney(Number(l.menuItem.price) * l.quantity, currency)}
                </span>
              </li>
            ))}
          </ul>
          <div className="checkout-summary__total">
            <span>الإجمالي</span>
            <span className="price">{formatMoney(subtotal, currency)}</span>
          </div>
          <p className="checkout-summary__note">
            بالضغط على تأكيد الطلب، توافق على معالجة بياناتك لإتمام الطلب فقط.
          </p>
        </aside>
      </div>
    </>
  )
}
