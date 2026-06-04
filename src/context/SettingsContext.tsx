import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CafeSettings } from '../types/database'
import {
  applyCafeTheme,
  DEFAULT_CAFE_SETTINGS,
  fetchCafeSettings,
  saveCafeSettings,
} from '../lib/cafeSettings'
import type { CafeSettingsPatch } from '../lib/cafeSettingsFields'

type SettingsContextValue = {
  settings: CafeSettings
  loading: boolean
  refresh: () => Promise<void>
  updateSettings: (patch: Partial<CafeSettingsPatch>) => Promise<{ error: string | null }>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_CAFE_SETTINGS)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const next = await fetchCafeSettings()
    setSettings(next)
    applyCafeTheme(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const updateSettings = useCallback(async (patch: Partial<CafeSettingsPatch>) => {
      const { error } = await saveCafeSettings(patch)
      if (!error) {
        setSettings((prev) => {
          const next = { ...prev, ...patch }
          applyCafeTheme(next)
          return next
        })
      }
      return { error }
    },
    []
  )

  const value = useMemo(
    () => ({ settings, loading, refresh, updateSettings }),
    [settings, loading, refresh, updateSettings]
  )

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
