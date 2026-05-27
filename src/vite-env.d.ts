/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Moyasar publishable key (pk_test_ / pk_live_) */
  readonly VITE_MOYASAR_PUBLISHABLE_KEY?: string
  /**
   * Where Moyasar redirects after payment (must match dashboard allowlist if any).
   * Default in code: production Vercel URL.
   */
  readonly VITE_MOYASAR_CALLBACK_URL?: string
  /**
   * Optional: full base URL to the verify API when testing locally against deployed backend.
   * Example: https://cafe-menu-indol.vercel.app/api
   */
  readonly VITE_MOYASAR_VERIFY_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Moyasar payment form (loaded from CDN) */
interface MoyasarInitOptions {
  element: string | Element
  amount: number
  currency: string
  description: string
  publishable_api_key: string
  callback_url: string
  methods: string[]
  supported_networks?: string[]
  language?: string
  apple_pay?: {
    country: string
    label: string
    validate_merchant_url: string
  }
  on_completed?: (payment: unknown) => void | Promise<void>
}

interface MoyasarGlobal {
  init: (options: MoyasarInitOptions) => void
}

interface Window {
  Moyasar?: MoyasarGlobal
}
