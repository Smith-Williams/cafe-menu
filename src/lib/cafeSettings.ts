import { supabase } from './supabase'
import type { CafeSettings } from '../types/database'
import { EVA_BRAND } from './brand'

/** Singleton cafe_settings row id (fixed UUID). */
export const CAFE_SETTINGS_ID = '00000000-0000-0000-0000-000000000001'

export const DEFAULT_CAFE_SETTINGS: CafeSettings = {
  id: CAFE_SETTINGS_ID,
  cafe_name_ar: EVA_BRAND.nameAr,
  tagline_ar: EVA_BRAND.taglineAr,
  logo_url: null,
  primary_color: EVA_BRAND.colors.rose,
  accent_color: EVA_BRAND.colors.cream,
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
  return `#${[mix(rgb.r), mix(rgb.g), mix(rgb.b)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')}`
}

export function applyCafeTheme(
  settings: Pick<CafeSettings, 'primary_color' | 'accent_color'>
) {
  const rose = settings.primary_color?.trim() || EVA_BRAND.colors.rose
  const cream = settings.accent_color?.trim() || EVA_BRAND.colors.cream
  const rgb = hexToRgb(rose)
  const root = document.documentElement

  root.style.setProperty('--rose', rose)
  root.style.setProperty('--gold', rose)
  root.style.setProperty('--cream', cream)
  root.style.setProperty('--accent', rose)
  root.style.setProperty('--accent-deep', EVA_BRAND.colors.primary)
  root.style.setProperty('--accent-hover', lighten(rose, 0.12))
  root.style.setProperty(
    '--accent-glow',
    rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)` : 'rgba(232, 160, 160, 0.35)'
  )
  root.style.setProperty(
    '--gold-glow',
    rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)` : 'rgba(232, 160, 160, 0.22)'
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
