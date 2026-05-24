import type { OrderWithItems } from '../../lib/normalizeOrder'
import { formatMoney } from '../../lib/format'

type Props = {
  order: OrderWithItems
  currency: string
  onDismiss: () => void
  onView: () => void
}

export function NewOrderToast({ order, currency, onDismiss, onView }: Props) {
  const itemSummary =
    order.items.length > 0
      ? order.items
          .slice(0, 3)
          .map((l) => `${l.item_name} ×${l.quantity}`)
          .join(' · ')
      : null

  return (
    <div
      className="order-notify-toast order-notify-toast--visible"
      role="alertdialog"
      aria-labelledby="order-notify-title"
    >
      <button
        type="button"
        className="order-notify-toast__close"
        onClick={onDismiss}
        aria-label="إغلاق"
      >
        ×
      </button>
      <div className="order-notify-toast__head">
        <span className="order-notify-toast__badge">جديد</span>
        <h3 id="order-notify-title" className="order-notify-toast__title">
          طلب جديد!
        </h3>
      </div>
      <div className="order-notify-toast__body">
        <p className="order-notify-toast__customer">
          <strong>{order.customer_name}</strong>
          <span dir="ltr" className="order-notify-toast__phone">
            {order.customer_phone}
          </span>
        </p>
        {itemSummary ? (
          <p className="order-notify-toast__items">{itemSummary}</p>
        ) : null}
        <p className="order-notify-toast__total">
          الإجمالي:{' '}
          <span className="price">{formatMoney(order.total_amount, currency)}</span>
        </p>
      </div>
      <button type="button" className="btn btn-primary btn-sm" onClick={onView}>
        عرض الطلب
      </button>
    </div>
  )
}
