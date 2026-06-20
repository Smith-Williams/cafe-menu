import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { EVA_BRAND } from '../lib/brand'
import { formatMoney } from '../lib/format'
import { loadMoyasarScript } from '../lib/loadMoyasarScript'
import { PickupNotice } from '../components/PickupNotice'
import { savePendingCheckout, type PendingCheckout } from '../lib/pendingCheckout'

const PICKUP_NOTE = 'استلام من الفرع'

const DEFAULT_MOYASAR_PK =
  'pk_test_3GvqyeppvaM5aSLWKyBaUakpFJqCXUUgFX9VbB4N'
const DEFAULT_CALLBACK = 'https://cafe-menu-indol.vercel.app/order-confirmation'

type Step = 'details' | 'pay'

export function CheckoutPage() {
  const { lines, subtotal } = useCart()
  const { settings } = useSettings()
  const currency = settings.currency_code
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [tableNo, setTableNo] = useState('')
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<Step>('details')
  const [error, setError] = useState<string | null>(null)
  const [moyasarLoading, setMoyasarLoading] = useState(false)
  const moyasarInitRef = useRef(false)
  const formHostRef = useRef<HTMLDivElement>(null)

  const publishableKey =
    import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY || DEFAULT_MOYASAR_PK
  const callbackUrl =
    import.meta.env.VITE_MOYASAR_CALLBACK_URL || DEFAULT_CALLBACK

  const halalas = Math.round(subtotal * 100)

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
    const orderNotes = userNotes ? `${tablePart} | ${userNotes}` : tablePart

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

            <p className="checkout-moyasar-note">
              الدفع يتم عبر <strong>Moyasar</strong> — بطاقات مدى وفيزا وماستركارد، Apple Pay،
              وSTC Pay. لن تُخزّن بيانات البطاقة على موقعنا.
            </p>

            <div className="checkout-form__actions">
              <button type="submit" className="btn btn-primary btn-lg">
                المتابعة للدفع
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
