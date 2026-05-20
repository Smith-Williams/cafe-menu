import { Link, useLocation, useParams } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { formatMoney } from '../lib/format'

type ConfirmLine = {
  name: string
  qty: number
  lineTotal: number
}

type LocationState = {
  customerName?: string
  phone?: string
  total?: number
  lines?: ConfirmLine[]
}

export function OrderConfirmationPage() {
  const { id } = useParams()
  const location = useLocation()
  const { settings } = useSettings()
  const currency = settings.currency_code
  const state = (location.state ?? {}) as LocationState

  return (
    <>
      <section className="page-hero page-hero--compact">
        <h1>تم استلام طلبك</h1>
        <p>شكراً لاختيار {settings.cafe_name_ar} — سنتواصل معكم قريباً.</p>
      </section>

      <div className="panel">
        <div className="success-banner">
          تم تسجيل الطلب بنجاح.
          {id ? (
            <>
              {' '}
              رقم المرجع: <strong dir="ltr">{id}</strong>
            </>
          ) : null}
        </div>

        {state.customerName ? (
          <p style={{ marginTop: 0 }}>
            <strong>الاسم:</strong> {state.customerName}
          </p>
        ) : null}
        {state.phone ? (
          <p>
            <strong>الجوال:</strong> <span dir="ltr">{state.phone}</span>
          </p>
        ) : null}

        {state.lines && state.lines.length > 0 ? (
          <div className="confirm-summary">
            <strong>تفاصيل الطلب</strong>
            <ul>
              {state.lines.map((l, i) => (
                <li key={`${l.name}-${i}`}>
                  <span>
                    {l.name} × {l.qty}
                  </span>
                  <span>{formatMoney(l.lineTotal, currency)}</span>
                </li>
              ))}
              {typeof state.total === 'number' ? (
                <li style={{ marginTop: '0.5rem', fontWeight: 700 }}>
                  <span>الإجمالي</span>
                  <span>{formatMoney(state.total, currency)}</span>
                </li>
              ) : null}
            </ul>
          </div>
        ) : (
          <p className="loading-inline" style={{ marginTop: '1rem' }}>
            احفظ رقم المرجع أعلاه للمتابعة. إذا أعدت تحميل الصفحة قد لا تظهر تفاصيل
            الطلب — هذا طبيعي لأن التأكيد يُعرض مرة واحدة بعد الإرسال.
          </p>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/" className="btn btn-primary">
            العودة إلى القائمة
          </Link>
        </div>
      </div>
    </>
  )
}
