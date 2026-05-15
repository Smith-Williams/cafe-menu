import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const addItem = useCallback((item: MenuItem, qty = 1) => {
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
    }),
    [
      lines,
      addItem,
      setQuantity,
      removeLine,
      clear,
      totalQuantity,
      subtotal,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
