import type { OrderStatus } from '../types/database'

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]

export function orderStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'قيد الانتظار'
    case 'confirmed':
      return 'مؤكد'
    case 'completed':
      return 'مكتمل'
    case 'cancelled':
      return 'ملغى'
    default:
      return status
  }
}
