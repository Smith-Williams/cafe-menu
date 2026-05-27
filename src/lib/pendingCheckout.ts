/** Session payload after customer submits details, before / after Moyasar redirect. */

export const PENDING_CHECKOUT_KEY = 'eva_pending_checkout'
const RECEIPT_PREFIX = 'eva_moyasar_receipt_'

export type PendingCheckoutLine = {
  menu_item_id: string
  quantity: number
  unit_price: number
  item_name_ar: string
}

export type PendingCheckout = {
  version: 1
  customer_name: string
  customer_phone: string
  notes: string | null
  /** Total in halalas (SAR × 100) for Moyasar + verification */
  total_halalas: number
  currency: string
  lines: PendingCheckoutLine[]
  created_at: string
}

export type MoyasarReceiptLine = {
  name: string
  qty: number
  lineTotal: number
}

export type MoyasarReceipt = {
  version: 1
  order_id: string
  customer_name: string
  customer_phone: string
  total: number
  lines: MoyasarReceiptLine[]
}

export function savePendingCheckout(data: PendingCheckout): void {
  sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(data))
}

export function loadPendingCheckout(): PendingCheckout | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PendingCheckout
    if (parsed?.version !== 1 || !parsed.lines?.length) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPendingCheckout(): void {
  sessionStorage.removeItem(PENDING_CHECKOUT_KEY)
}

export function saveMoyasarReceipt(paymentId: string, receipt: MoyasarReceipt): void {
  sessionStorage.setItem(`${RECEIPT_PREFIX}${paymentId}`, JSON.stringify(receipt))
}

export function loadMoyasarReceipt(paymentId: string): MoyasarReceipt | null {
  try {
    const raw = sessionStorage.getItem(`${RECEIPT_PREFIX}${paymentId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MoyasarReceipt
    if (parsed?.version !== 1 || !parsed.order_id) return null
    return parsed
  } catch {
    return null
  }
}
