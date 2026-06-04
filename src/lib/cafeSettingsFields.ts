import type { CafeSettings } from '../types/database'

/** Fields editable from admin + shown on the public site */
export type CafeSettingsPatch = Pick<
  CafeSettings,
  | 'cafe_name_ar'
  | 'tagline_ar'
  | 'logo_url'
  | 'primary_color'
  | 'accent_color'
  | 'currency_code'
  | 'phone_display'
  | 'phone_tel'
  | 'whatsapp_number'
  | 'business_hours'
  | 'address_ar'
  | 'maps_url'
  | 'instagram_url'
>

/** Form state — empty strings instead of null */
export type CafeSettingsDraft = {
  cafe_name_ar: string
  tagline_ar: string
  logo_url: string
  primary_color: string
  accent_color: string
  currency_code: string
  phone_display: string
  phone_tel: string
  whatsapp_number: string
  business_hours: string
  address_ar: string
  maps_url: string
  instagram_url: string
}

export function settingsDraftFrom(settings: CafeSettings): CafeSettingsDraft {
  return {
    cafe_name_ar: settings.cafe_name_ar,
    tagline_ar: settings.tagline_ar ?? '',
    logo_url: settings.logo_url ?? '',
    primary_color: settings.primary_color,
    accent_color: settings.accent_color,
    currency_code: settings.currency_code,
    phone_display: settings.phone_display ?? '',
    phone_tel: settings.phone_tel ?? '',
    whatsapp_number: settings.whatsapp_number ?? '',
    business_hours: settings.business_hours ?? '',
    address_ar: settings.address_ar ?? '',
    maps_url: settings.maps_url ?? '',
    instagram_url: settings.instagram_url ?? '',
  }
}

export const CAFE_SETTINGS_PATCH_KEYS: (keyof CafeSettingsPatch)[] = [
  'cafe_name_ar',
  'tagline_ar',
  'logo_url',
  'primary_color',
  'accent_color',
  'currency_code',
  'phone_display',
  'phone_tel',
  'whatsapp_number',
  'business_hours',
  'address_ar',
  'maps_url',
  'instagram_url',
]
