export function formatMoney(amount: number, currency = 'SAR'): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency || 'SAR',
    minimumFractionDigits: 2,
  }).format(amount)
}
