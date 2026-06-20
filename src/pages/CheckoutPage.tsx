import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { EVA_BRAND } from '../lib/brand'
import { formatMoney } from '../lib/format'
import { loadMoyasarScript } from '../lib/loadMoyasarScript'
import { PickupNotice } from '../components/PickupNotice'
import { savePendingCheckout, type PendingCheckout } from '../lib/pendingCheckout'
import { supabase } from '../lib/supabase'

const PICKUP_NOTE = 'استلام من الفرع'

const DEFAULT_MOYASAR_PK =
  'pk_test_3GvqyeppvaM5aSLWKyBaUakpFJqCXUUgFX9VbB4N'
const DEFAULT_CALLBACK = 'https://cafe-menu-indol.vercel.app/order-confirmation'

type Step = 'details' | 'pay'
type PayMethod = 'online' | 'cash'

export function CheckoutPage() {
  const { lines, subtotal, clear } = useCart()
  const { settings } = useSettings()
  const currency = settings.currency_code
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [tableNo, setTableNo] = useState('')
  const [notes, setNotes] = useState('')
  const [payMethod, setPayMethod] = useState<PayMethod>('online')
  const [step, setStep] = useState<Step>('details')
  const [error, setError] = useState<string | null>(null)
  const [cashLoading, setCashLoading] = useState(false)
  const [moyasarLoading, setMoyasarLoading] = useState(false)
  const moyasarInitRef = useRef(false)
  const formHostRef = useRef<HTMLDivElement>(null)

  const publishableKey =
    import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY || DEFAULT_MOYASAR_PK
  const callbackUrl =
    import.meta.env.VITE_MOYASAR_CALLBACK_URL || DEFAULT_CALLBACK

  const navigate = useNavigate()
  const halalas = Math.round(subtotal * 100)

  async function placeCashOrder(orderNotes: string) {
    setCashLoading(true)
    setError(null)
    try {
      const pLines = lines.map((l) => ({
        menu_item_id: l.menuItem.id,
        quantity: l.quantity,
        unit_price: Number(l.menuItem.price),
        item_name_ar: l.menuItem.name_ar,
      }))
      const { data: orderId, error: rpcErr } = await supabase.rpc('create_order_with_items', {
        p_customer_name: name.trim(),
        p_customer_phone: phone.trim(),
        p_notes: orderNotes,
        p_total_amount: subtotal,
        p_lines: pLines,
      })
      if (rpcErr || !orderId) {
        setError(rpcErr?.message ?? 'تعذّر تسجيل الطلب، حاول مجدداً.')
        return
      }
      clear()
      navigate(`/order-confirmation/${orderId}`, {
        state: {
          customerName: name.trim(),
          phone: phone.trim(),
          total: subtotal,
          lines: lines.map((l) => ({
            name: l.menuItem.name_ar,
            qty: l.quantity,
            lineTotal: Number(l.menuItem.price) * l.quantity,
          })),
        },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع')
    } finally {
      setCashLoading(false)
    }
  }

  const initMoyasar = useCallback(async () => {
    if (moyasarInitRef.current || !formHostRef.current) return
    setMoyasarLoading(true)
    setError(null)
    try {
      await loadMoyasarScript()
      if (!window.Moyasar) {
        setError('مكتبة الدفع غير متاحة.')
        setMoyasarLoading(false)
        return
      }

      const el = formHostRef.current
      el.innerHTML = ''
      const mount = document.createElement('div')
      mount.className = 'mysr-form-eva'
      el.appendChild(mount)

      window.Moyasar.init({
        element: mount,
        amount: halalas,
        currency: 'SAR',
        description: `EVA Coffee — طلب ${new Date().toISOString().slice(0, 10)}`,
        publishable_api_key: publishableKey,
        callback_url: callbackUrl,
        // Official schemes: mada, visa, mastercard (see Moyasar form docs). Omit unionpay/amex
        // unless enabled on the account — mis-listed networks can surface as unsupported card type.
        methods: ['creditcard', 'applepay', 'stcpay'],
        supported_networks: ['mada', 'visa', 'mastercard'],
        language: 'ar',
        apple_pay: {
          country: 'SA',
          label: 'EVA Coffee',
          validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
        },
        on_completed: async function (payment: unknown) {
          try {
            const p = payment as { id?: string }
            if (p?.id) {
              sessionStorage.setItem('eva_last_moyasar_payment_id', String(p.id))
            }
          } catch {
            /* ignore */
          }
        },
      })

      moyasarInitRef.current = true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر تهيئة الدفع')
    } finally {
      setMoyasarLoading(false)
    }
  }, [callbackUrl, halalas, publishableKey])

  useEffect(() => {
    if (step !== 'pay' || lines.length === 0) return
    moyasarInitRef.current = false
    void initMoyasar()
  }, [step, lines.length, initMoyasar])

  function goToPayment(e: FormEvent) {
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
    // Saudi phone validation: 05xxxxxxxx or +9665xxxxxxxx
    const saudiPhone = /^(05\d{8}|(\+966|00966)5\d{8})$/
    if (!saudiPhone.test(trimmedPhone.replace(/\s/g, ''))) {
      setError('رقم الجوال غير صحيح — مثال: 0512345678')
      return
    }

    if (halalas < 100) {
      setError('الحد الأدنى للدفع عبر Moyasar هو ١٫٠٠ ر.س.')
      return
    }

    const userNotes = notes.trim()
    const tablePart = tableNo.trim() ? `طاولة ${tableNo.trim()}` : PICKUP_NOTE
    const payPart = payMethod === 'cash' ? 'كاش عند الاستلام' : null
    const orderNotes = [tablePart, payPart, userNotes || null].filter(Boolean).join(' | ')

    if (payMethod === 'cash') {
      void placeCashOrder(orderNotes)
      return
    }

    const pending: PendingCheckout = {
      version: 1,
      customer_name: trimmedName,
      customer_phone: trimmedPhone,
      notes: orderNotes,
      total_halalas: halalas,
      currency: 'SAR',
      lines: lines.map((line) => ({
        menu_item_id: line.menuItem.id,
        quantity: line.quantity,
        unit_price: Number(line.menuItem.price),
        item_name_ar: line.menuItem.name_ar,
      })),
      created_at: new Date().toISOString(),
    }
    savePendingCheckout(pending)
    setStep('pay')
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
        <p>
          {step === 'details'
            ? 'أدخل بياناتك للاستلام من الفرع، ثم أكمل الدفع بأمان.'
            : 'اختر طريقة الدفع — بطاقة، Apple Pay، أو STC Pay.'}
        </p>
      </section>

      <div className="checkout-layout">
        {step === 'details' ? (
          <form onSubmit={goToPayment} className="checkout-form panel">
            <h2 className="checkout-section-title">بيانات الطلب</h2>

            <PickupNotice />

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
              <label className="field">
                <span className="field__label">رقم الطاولة (اختياري)</span>
                <input
                  type="text"
                  className="field__input"
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                  placeholder="مثال: 5"
                  inputMode="numeric"
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

            <div className="pay-method-wrap">
              <p className="pay-method-label">اختر طريقة الدفع</p>

              <label className={`pay-card-option${payMethod === 'online' ? ' pay-card-option--active' : ''}`}>
                <input type="radio" name="payMethod" value="online" checked={payMethod === 'online'} onChange={() => setPayMethod('online')} />
                <div className="pay-card-option__inner">
                  <div className="pay-card-option__top">
                    <span className="pay-card-option__title">الدفع الإلكتروني</span>
                    {payMethod === 'online' && <span className="pay-card-option__check">✓</span>}
                  </div>
                  <div className="pay-badges">
                    <span className="pay-badge pay-badge--apple">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                      Apple Pay
                    </span>
                    <span className="pay-badge pay-badge--mada">مدى</span>
                    <span className="pay-badge pay-badge--visa">
                      <svg viewBox="0 0 38 24" width="28" height="18"><rect width="38" height="24" rx="4" fill="#1a1f71"/><path d="M15.68 7.28L13.5 16.72h-2.44l2.18-9.44h2.44zm9.9 6.1l1.28-3.54.74 3.54h-2.02zm2.74 3.34H30.5l-1.82-9.44h-2.04c-.46 0-.85.27-1.02.68l-3.6 8.76h2.52l.5-1.38h3.08l.3 1.38zm-6.26-3.08c.01-2.45-3.38-2.58-3.36-3.68.01-.33.32-.68.1-.96-.26-.27-.68-.3-1.04-.3-1.1 0-2.18.3-3.1.84l.44 2.04c.72-.42 1.54-.72 2.38-.72.52 0 1.1.2 1.1.72 0 1.16-2.94 1.04-2.94 3.58 0 1.54 1.42 2.38 2.94 2.38.84 0 1.66-.2 2.4-.56l-.44-2.04c-.6.3-1.26.5-1.92.5-.48 0-1.04-.22-1.04-.72.01-.84 1.48-.98 2.48-1.08zM14.06 7.28l-3.88 9.44H7.6L5.72 9.1c-.1-.44-.2-.6-.54-.78C4.6 8.04 3.84 7.8 3.1 7.66l.06-.38h4.06c.52 0 .98.34 1.1.9l1 5.3 2.46-6.2h2.28z" fill="#fff"/></svg>
                    </span>
                    <span className="pay-badge pay-badge--stc">STC Pay</span>
                  </div>
                </div>
              </label>

              <label className={`pay-cash-option${payMethod === 'cash' ? ' pay-cash-option--active' : ''}`}>
                <input type="radio" name="payMethod" value="cash" checked={payMethod === 'cash'} onChange={() => setPayMethod('cash')} />
                <span className="pay-cash-option__dot" />
                <span className="pay-cash-option__text">
                  <strong>الدفع كاش عند الاستلام</strong>
                  <small>ادفع نقداً عند استلام طلبك من الفرع</small>
                </span>
                {payMethod === 'cash' && <span className="pay-card-option__check">✓</span>}
              </label>
            </div>

            <div className="checkout-form__actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={cashLoading}>
                {cashLoading ? 'جاري إرسال الطلب…' : payMethod === 'cash' ? 'تأكيد الطلب' : 'المتابعة للدفع'}
              </button>
              <Link to="/cart" className="btn btn-ghost">
                العودة للسلة
              </Link>
            </div>
          </form>
        ) : (
          <div className="checkout-form panel checkout-pay-panel">
            <h2 className="checkout-section-title">الدفع الآمن</h2>
            <p className="checkout-pay-amount">
              المبلغ المستحق:{' '}
              <span className="price">{formatMoney(subtotal, currency)}</span>
            </p>

            {error ? (
              <div className="error-banner" role="alert">
                {error}
              </div>
            ) : null}

            {moyasarLoading ? (
              <p className="loading-inline">جاري تحميل نموذج الدفع…</p>
            ) : null}

            <div ref={formHostRef} className="checkout-moyasar-host" />

            <div className="checkout-form__actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setStep('details')
                  moyasarInitRef.current = false
                  if (formHostRef.current) formHostRef.current.innerHTML = ''
                }}
              >
                تعديل البيانات
              </button>
            </div>
          </div>
        )}

        <aside className="checkout-summary panel">
          <PickupNotice compact />
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
            بعد نجاح الدفع ستُوجَّه إلى صفحة التأكيد لإتمام تسجيل الطلب.
          </p>
        </aside>
      </div>
    </>
  )
}
