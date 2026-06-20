export function formatMoney(amount: number, currency = 'SAR'): string {
  const num = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  if (currency === 'SAR') return `${num} ر.س`
  return `${num} ${currency}`
}
