import type { OrderWithItems } from '../../lib/normalizeOrder'
import { formatMoney } from '../../lib/format'

type Props = {
  orders: OrderWithItems[]
  currency: string
}

type StatCard = {
  label: string
  value: string
  sub?: string
  accent?: boolean
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function calcStats(orders: OrderWithItems[], currency: string) {
  const today = todayStr()

  const todayOrders = orders.filter(
    (o) => o.status !== 'cancelled' && o.created_at.slice(0, 10) === today
  )
  const activeOrders = orders.filter((o) => o.status !== 'cancelled')

  const todayRevenue = todayOrders.reduce((s, o) => s + o.total_amount, 0)
  const totalRevenue = activeOrders.reduce((s, o) => s + o.total_amount, 0)
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const completedCount = orders.filter((o) => o.status === 'completed').length

  // Top items
  const itemCounts = new Map<string, number>()
  for (const order of activeOrders) {
    for (const line of order.items) {
      const prev = itemCounts.get(line.item_name) ?? 0
      itemCounts.set(line.item_name, prev + line.quantity)
    }
  }
  const topItems = [...itemCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const stats: StatCard[] = [
    {
      label: 'إيراد اليوم',
      value: formatMoney(todayRevenue, currency),
      sub: `${todayOrders.length} طلب اليوم`,
      accent: true,
    },
    {
      label: 'إجمالي الإيراد',
      value: formatMoney(totalRevenue, currency),
      sub: `${activeOrders.length} طلب إجمالي`,
    },
    {
      label: 'قيد الانتظار',
      value: String(pendingCount),
      sub: 'طلب بانتظار تأكيد',
    },
    {
      label: 'مكتملة',
      value: String(completedCount),
      sub: 'طلب مكتمل',
    },
  ]

  return { stats, topItems }
}

export function AnalyticsPanel({ orders, currency }: Props) {
  const { stats, topItems } = calcStats(orders, currency)

  return (
    <div className="analytics-wrap">
      <div className="analytics-stats">
        {stats.map((s) => (
          <div key={s.label} className={`analytics-card${s.accent ? ' analytics-card--accent' : ''}`}>
            <span className="analytics-card__label">{s.label}</span>
            <span className="analytics-card__value">{s.value}</span>
            {s.sub ? <span className="analytics-card__sub">{s.sub}</span> : null}
          </div>
        ))}
      </div>

      {topItems.length > 0 ? (
        <div className="analytics-top">
          <h3 className="analytics-top__title">أكثر الأصناف طلباً</h3>
          <ol className="analytics-top__list">
            {topItems.map(([name, count], i) => (
              <li key={name} className="analytics-top__row">
                <span className="analytics-top__rank">#{i + 1}</span>
                <span className="analytics-top__name">{name}</span>
                <span className="analytics-top__count">{count}×</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  )
}
