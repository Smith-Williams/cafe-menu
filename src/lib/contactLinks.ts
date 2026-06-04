/** Normalize Saudi mobile for tel: / wa.me links */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function toTelHref(phoneTel: string | null | undefined): string | null {
  const raw = phoneTel?.trim()
  if (!raw) return null
  const d = digitsOnly(raw)
  if (!d) return null
  if (raw.startsWith('+')) return `tel:${raw.replace(/\s/g, '')}`
  if (d.startsWith('966')) return `tel:+${d}`
  if (d.startsWith('0')) return `tel:+966${d.slice(1)}`
  if (d.length === 9) return `tel:+966${d}`
  return `tel:${raw}`
}

export function toWhatsAppHref(
  whatsappNumber: string | null | undefined,
  message?: string
): string | null {
  const d = digitsOnly(whatsappNumber ?? '')
  if (!d) return null
  let n = d
  if (n.startsWith('0')) n = `966${n.slice(1)}`
  else if (!n.startsWith('966') && n.length <= 10) n = `966${n}`
  const base = `https://wa.me/${n}`
  if (message?.trim()) {
    return `${base}?text=${encodeURIComponent(message.trim())}`
  }
  return base
}

export function formatPhoneDisplay(
  phoneDisplay: string | null | undefined,
  phoneTel: string | null | undefined
): string | null {
  const display = phoneDisplay?.trim()
  if (display) return display
  const tel = phoneTel?.trim()
  return tel || null
}
