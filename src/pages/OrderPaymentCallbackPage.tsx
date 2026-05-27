import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { formatMoney } from '../lib/format'
import {
  clearPendingCheckout,
  loadMoyasarReceipt,
  loadPendingCheckout,
  saveMoyasarReceipt,
  type MoyasarReceipt,
} from '../lib/pendingCheckout'

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | {
      kind: 'success'
      orderId: string
      customerName: string
      phone: string
      total: number
      lines: MoyasarReceipt['lines']
    }

function verifyApiUrl(): string {
  const base = import.meta.env.VITE_MOYASAR_VERIFY_API?.replace(/\/$/, '')
  if (base) return `${base}/moyasar-verify`
  return '/api/moyasar-verify'
}

async function verifyPayment(paymentId: string) {
  const res = await fetch(verifyApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId }),
  })
  const data = (await res.json()) as {
    error?: string
    status?: string
    amount?: number
    currency?: string
    id?: string
  }
  if (!res.ok) {
    throw new Error(data.error || 'فشل التحقق من الدفع')
  }
  return data
}

export function OrderPaymentCallbackPage() {
  const [searchParams] = useSearchParams()
  const { clear } = useCart()
  const { settings } = useSettings()
  const currency = settings.currency_code
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function run() {
      const paymentId = searchParams.get('id')?.trim()
      if (!paymentId) {
        setState({ kind: 'error', message: 'رابط غير صالح: لا يوجد معرّف دفع.' })
        return
      }

      const cached = loadMoyasarReceipt(paymentId)
      if (cached) {
        setState({
          kind: 'success',
          orderId: cached.order_id,
          customerName: cached.customer_name,
          phone: cached.customer_phone,
          total: cached.total,
          lines: cached.lines,
        })
        clear()
        return
      }

      const pending = loadPendingCheckout()
      if (!pending) {
        setState({
          kind: 'error',
          message:
            'لم نجد بيانات الطلب في المتصفح. افتح الرابط من نفس الجهاز الذي أتممت منه الدفع، أو تواصل مع المقهى مع رقم الدفع.',
        })
        return
      }

      try {
        const payment = await verifyPayment(paymentId)
        if (cancelled) return

        const paid = String(payment.status || '').toLowerCase() === 'paid'
        const amountOk = Number(payment.amount) === pending.total_halalas
        const currencyOk =
          String(payment.currency || '').toUpperCase() === pending.currency.toUpperCase()

        if (!paid || !amountOk || !currencyOk) {
          setState({
            kind: 'error',
            message: paid
              ? 'مبلغ الدفع لا يطابق الطلب. تواصل مع الدعم.'
              : 'لم يُكمل الدفع بنجاح. الحالة: ' + (payment.status ?? 'غير معروف'),
          })
          return
        }

        const again = loadMoyasarReceipt(paymentId)
        if (again) {
          setState({
            kind: 'success',
            orderId: again.order_id,
            customerName: again.customer_name,
            phone: again.customer_phone,
            total: again.total,
            lines: again.lines,
          })
          clearPendingCheckout()
          clear()
          return
        }

        const p_lines = pending.lines.map((l) => ({
          menu_item_id: l.menu_item_id,
          quantity: l.quantity,
          unit_price: l.unit_price,
          item_name_ar: l.item_name_ar,
        }))

        const notesWithPayment = pending.notes
          ? `${pending.notes} | Moyasar: ${paymentId}`
          : `Moyasar: ${paymentId}`

        const { data: orderId, error: rpcErr } = await supabase.rpc('create_order_with_items', {
          p_customer_name: pending.customer_name,
          p_customer_phone: pending.customer_phone,
          p_notes: notesWithPayment,
          p_total_amount: pending.total_halalas / 100,
          p_lines: p_lines,
        })

        if (cancelled) return

        if (rpcErr || !orderId) {
          setState({
            kind: 'error',
            message:
              rpcErr?.message ??
              'تم الدفع بنجاح لكن تعذّر تسجيل الطلب. احفظ معرّف الدفع وتواصل معنا: ' + paymentId,
          })
          return
        }

        const receipt: MoyasarReceipt = {
          version: 1,
          order_id: String(orderId),
          customer_name: pending.customer_name,
          customer_phone: pending.customer_phone,
          total: pending.total_halalas / 100,
          lines: pending.lines.map((l) => ({
            name: l.item_name_ar,
            qty: l.quantity,
            lineTotal: l.unit_price * l.quantity,
          })),
        }

        saveMoyasarReceipt(paymentId, receipt)
        clearPendingCheckout()
        clear()

        setState({
          kind: 'success',
          orderId: receipt.order_id,
          customerName: receipt.customer_name,
          phone: receipt.customer_phone,
          total: receipt.total,
          lines: receipt.lines,
        })
      } catch (e) {
        if (!cancelled) {
          setState({
            kind: 'error',
            message: e instanceof Error ? e.message : 'حدث خطأ غير متوقع',
          })
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [searchParams, clear])

  if (state.kind === 'loading') {
    return (
      <section className="panel checkout-callback">
        <p className="loading-inline">جاري تأكيد الدفع وتسجيل الطلب…</p>
      </section>
    )
  }

  if (state.kind === 'error') {
    return (
      <>
        <section className="page-hero page-hero--compact">
          <h1>تعذّر إتمام الطلب</h1>
        </section>
        <div className="panel checkout-callback">
          <div className="error-banner" role="alert">
            {state.message}
          </div>
          <div className="checkout-callback__actions">
            <Link to="/cart" className="btn btn-primary">
              العودة للسلة
            </Link>
            <Link to="/" className="btn btn-ghost">
              القائمة
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <section className="page-hero page-hero--compact">
        <h1>تم الدفع بنجاح</h1>
        <p>شكراً لاختيارك EVA Coffee — طلبك مسجّل.</p>
      </section>

      <div className="panel checkout-callback">
        <div className="success-banner">
          تم تأكيد الدفع وتسجيل الطلب.
          <br />
          رقم الطلب: <strong dir="ltr">{state.orderId}</strong>
        </div>

        <p>
          <strong>الاسم:</strong> {state.customerName}
        </p>
        <p>
          <strong>الجوال:</strong> <span dir="ltr">{state.phone}</span>
        </p>

        {state.lines.length > 0 ? (
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
              <li className="confirm-summary__total">
                <span>الإجمالي</span>
                <span>{formatMoney(state.total, currency)}</span>
              </li>
            </ul>
          </div>
        ) : null}

        <div className="checkout-callback__actions">
          <Link to="/" className="btn btn-primary">
            العودة إلى القائمة
          </Link>
        </div>
      </div>
    </>
  )
}
