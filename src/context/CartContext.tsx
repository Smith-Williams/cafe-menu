import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { MenuItem } from '../types/database'

const STORAGE_KEY = 'cafe-menu-cart'

export type CartLine = {
  menuItem: MenuItem
  quantity: number
}

type CartContextValue = {
  lines: CartLine[]
  addItem: (item: MenuItem, qty?: number) => void
  setQuantity: (menuItemId: string, quantity: number) => void
  removeLine: (menuItemId: string) => void
  clear: () => void
  totalQuantity: number
  subtotal: number
  addedToast: string | null
  dismissToast: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function loadLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => loadLines())
  const [addedToast, setAddedToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const dismissToast = useCallback(() => {
    setAddedToast(null)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
  }, [])

  const addItem = useCallback((item: MenuItem, qty = 1) => {
    const label = item.name_ar || 'العنصر'
    setAddedToast(`تمت إضافة «${label}» إلى السلة`)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setAddedToast(null), 2600)

    setLines((prev) => {
      const next = [...prev]
      const idx = next.findIndex((l) => l.menuItem.id === item.id)
      if (idx >= 0) {
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + qty,
        }
      } else {
        next.push({ menuItem: item, quantity: qty })
      }
      return next
    })
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setLines((prev) => prev.filter((l) => l.menuItem.id !== menuItemId))
      return
    }
    setLines((prev) =>
      prev.map((l) =>
        l.menuItem.id === menuItemId ? { ...l, quantity } : l
      )
    )
  }, [])

  const removeLine = useCallback((menuItemId: string) => {
    setLines((prev) => prev.filter((l) => l.menuItem.id !== menuItemId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const totalQuantity = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  )

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, l) => sum + l.quantity * Number(l.menuItem.price), 0),
    [lines]
  )

  const value = useMemo(
    () => ({
      lines,
      addItem,
      setQuantity,
      removeLine,
      clear,
      totalQuantity,
      subtotal,
      addedToast,
      dismissToast,
    }),
    [
      lines,
      addItem,
      setQuantity,
      removeLine,
      clear,
      totalQuantity,
      subtotal,
      addedToast,
      dismissToast,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
