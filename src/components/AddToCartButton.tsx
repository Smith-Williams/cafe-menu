import { useEffect, useRef, useState } from 'react'
import type { MenuItem } from '../types/database'

type Props = {
  item: MenuItem
  onAdd: (item: MenuItem) => void
}

export function AddToCartButton({ item, onAdd }: Props) {
  const [justAdded, setJustAdded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleClick() {
    onAdd(item)
    setJustAdded(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setJustAdded(false), 1800)
  }

  return (
    <button
      type="button"
      className={`btn btn-primary btn-add-cart${justAdded ? ' btn-add-cart--success' : ''}`}
      onClick={handleClick}
      aria-live="polite"
    >
      <span className="btn-add-cart__label">
        {justAdded ? 'تمت الإضافة ✓' : 'أضف للسلة'}
      </span>
    </button>
  )
}
