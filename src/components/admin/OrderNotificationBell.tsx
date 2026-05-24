type Props = {
  orderCount: number
  ringing: boolean
  live: boolean
}

export function OrderNotificationBell({ orderCount, ringing, live }: Props) {
  return (
    <div
      className={`admin-bell${ringing ? ' admin-bell--ring' : ''}`}
      title={live ? 'الإشعارات الفورية مفعّلة' : 'جاري الاتصال بالإشعارات…'}
    >
      <span className="admin-bell__icon" aria-hidden>
        🔔
      </span>
      {orderCount > 0 ? (
        <span className="admin-bell__count" aria-label={`${orderCount} طلب`}>
          {orderCount > 99 ? '99+' : orderCount}
        </span>
      ) : null}
      {live ? <span className="admin-bell__live" aria-hidden /> : null}
    </div>
  )
}
