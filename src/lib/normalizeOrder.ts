import { pickString } from './pickField'

export type OrderLine = {
  quantity: number
  unit_price: number
  item_name: string
}

export type OrderWithItems = {
  id: string
  customer_name: string
  customer_phone: string
  total_amount: number
  status: string
  notes: string | null
  created_at: string
  items: OrderLine[]
}

export function normalizeOrderLine(row: Record<string, unknown>): OrderLine {
  const name = pickString(
    row,
    ['item_name_ar', 'item_name', 'name', 'product_name', 'title'],
    '—'
  )
  return {
    quantity: Number(row.quantity ?? 1),
    unit_price: Number(row.unit_price ?? row.price ?? 0),
    item_name: name,
  }
}

/** Map Supabase `orders` + nested `order_items` to app shape. */
export function normalizeOrder(row: Record<string, unknown>): OrderWithItems {
  const nested =
    row.order_items ?? row.items ?? row.order_lines ?? row.lines ?? []
  const rawLines = Array.isArray(nested) ? nested : []

  const customerName = pickString(
    row,
    ['customer_name', 'customerName', 'name', 'full_name', 'client_name'],
    '—'
  )
  const customerPhone = pickString(
    row,
    ['customer_phone', 'customerPhone', 'phone', 'mobile', 'tel'],
    '—'
  )
  const total =
    row.total_amount ?? row.total ?? row.amount ?? row.grand_total ?? 0

  return {
    id: String(row.id),
    customer_name: customerName,
    customer_phone: customerPhone,
    total_amount: Number(total),
    status: String(row.status ?? 'pending'),
    notes:
      row.notes != null && row.notes !== '' ? String(row.notes) : null,
    created_at: String(row.created_at ?? new Date().toISOString()),
    items: rawLines.map((line) =>
      normalizeOrderLine(line as Record<string, unknown>)
    ),
  }
}

export function normalizeOrders(rows: unknown[]): OrderWithItems[] {
  return rows.map((row) => normalizeOrder(row as Record<string, unknown>))
}

/** Attach order_items rows fetched separately (when nested select is unavailable). */
export function mergeOrdersWithItems(
  orders: unknown[],
  orderItems: unknown[]
): OrderWithItems[] {
  const itemsByOrderId = new Map<string, OrderLine[]>()

  for (const raw of orderItems) {
    const line = normalizeOrderLine(raw as Record<string, unknown>)
    const orderId = String((raw as Record<string, unknown>).order_id ?? '')
    if (!orderId) continue
    const list = itemsByOrderId.get(orderId) ?? []
    list.push(line)
    itemsByOrderId.set(orderId, list)
  }

  return orders.map((raw) => {
    const order = normalizeOrder(raw as Record<string, unknown>)
    if (order.items.length > 0) return order
    return {
      ...order,
      items: itemsByOrderId.get(order.id) ?? [],
    }
  })
}
