import { useEffect, useRef, useState } from 'react'
import type { MenuItem } from '../types/database'

type Props = {
  item: MenuItem
  onAdd: (item: MenuItem) => void
}

export function AddToCartButton({ item, onAdd }: Props) {
  const [justAdded, setJustAdded] = useState(false)
  const [pulsing, setPulsing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pulseRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (pulseRef.current) clearTimeout(pulseRef.current)
    }
  }, [])

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    onAdd(item)
    setJustAdded(true)
    setPulsing(true)

    // Floating +1 particle
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const particle = document.createElement('div')
    particle.className = 'add-cart-particle'
    particle.textContent = '+1'
    particle.style.left = `${rect.left + rect.width / 2}px`
    particle.style.top = `${rect.top - 4}px`
    document.body.appendChild(particle)
    setTimeout(() => particle.remove(), 700)

    if (timerRef.current) clearTimeout(timerRef.current)
    if (pulseRef.current) clearTimeout(pulseRef.current)
    timerRef.current = setTimeout(() => setJustAdded(false), 1800)
    pulseRef.current = setTimeout(() => setPulsing(false), 420)
  }

  return (
    <button
      type="button"
      className={`btn btn-primary btn-add-cart${justAdded ? ' btn-add-cart--success' : ''}${pulsing ? ' btn-add-cart--pulse' : ''}`}
      onClick={handleClick}
      aria-live="polite"
    >
      <span className="btn-add-cart__icon" aria-hidden>
        {justAdded ? '✓' : '+'}
      </span>
      <span className="btn-add-cart__label">
        {justAdded ? 'تم' : 'أضف'}
      </span>
    </button>
  )
}
