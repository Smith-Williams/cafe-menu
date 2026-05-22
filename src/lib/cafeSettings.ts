import { supabase } from './supabase'
import type { CafeSettings } from '../types/database'

/** Singleton cafe_settings row id (fixed UUID). */
export const CAFE_SETTINGS_ID = '00000000-0000-0000-0000-000000000001'

export const DEFAULT_CAFE_SETTINGS: CafeSettings = {
  id: CAFE_SETTINGS_ID,
  cafe_name_ar: 'مقهى الدُّفء',
  tagline_ar: 'قهوة مختصة ومخبوزات طازجة — اطلب بسهولة',
  logo_url: null,
  primary_color: '#c9a87c',
  accent_color: '#8b6f47',
  currency_code: 'SAR',
  updated_at: new Date().toISOString(),
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '').trim()
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null
  const n = parseInt(cleaned, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  const r = mix(rgb.r)
  const g = mix(rgb.g)
  const b = mix(rgb.b)
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

export function applyCafeTheme(settings: Pick<CafeSettings, 'primary_color' | 'accent_color'>) {
  const primary = settings.primary_color?.trim() || DEFAULT_CAFE_SETTINGS.primary_color
  const accent = settings.accent_color?.trim() || DEFAULT_CAFE_SETTINGS.accent_color
  const root = document.documentElement
  root.style.setProperty('--accent', primary)
  root.style.setProperty('--accent-deep', accent)
  root.style.setProperty('--accent-hover', lighten(primary, 0.12))
  root.style.setProperty(
    '--accent-glow',
    hexToRgb(primary)
      ? `rgba(${hexToRgb(primary)!.r}, ${hexToRgb(primary)!.g}, ${hexToRgb(primary)!.b}, 0.28)`
      : 'rgba(201, 168, 124, 0.28)'
  )
}

export async function fetchCafeSettings(): Promise<CafeSettings> {
  const { data, error } = await supabase
    .from('cafe_settings')
    .select('*')
    .eq('id', CAFE_SETTINGS_ID)
    .maybeSingle()

  if (error || !data) return DEFAULT_CAFE_SETTINGS
  return { ...DEFAULT_CAFE_SETTINGS, ...data }
}

export async function saveCafeSettings(
  patch: Partial<
    Pick<
      CafeSettings,
      | 'cafe_name_ar'
      | 'tagline_ar'
      | 'logo_url'
      | 'primary_color'
      | 'accent_color'
      | 'currency_code'
    >
  >
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('cafe_settings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', CAFE_SETTINGS_ID)

  return { error: error?.message ?? null }
}
