import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { normalizeOrder, type OrderWithItems } from '../lib/normalizeOrder'
import { playNewOrderSound } from '../lib/notificationSound'

type Options = {
  enabled: boolean
  onNewOrder: (order: OrderWithItems) => void
}

async function fetchOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle()

  if (error || !data) return null
  return normalizeOrder(data as Record<string, unknown>)
}

/**
 * Subscribe to new rows on `orders` via Supabase Realtime.
 */
export function useOrderRealtime({ enabled, onNewOrder }: Options) {
  const onNewOrderRef = useRef(onNewOrder)
  const seenIdsRef = useRef<Set<string>>(new Set())
  const listeningRef = useRef(false)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    onNewOrderRef.current = onNewOrder
  }, [onNewOrder])

  const seedSeenOrders = useCallback((orderIds: string[]) => {
    orderIds.forEach((id) => seenIdsRef.current.add(id))
  }, [])

  useEffect(() => {
    if (!enabled) {
      setIsLive(false)
      return
    }

    let cancelled = false

    const readyTimer = window.setTimeout(() => {
      listeningRef.current = true
    }, 1500)

    const channel = supabase
      .channel('admin-new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (!listeningRef.current || cancelled) return

          const row = payload.new as Record<string, unknown>
          const orderId = String(row.id ?? '')
          if (!orderId || seenIdsRef.current.has(orderId)) return
          seenIdsRef.current.add(orderId)

          void (async () => {
            await new Promise((r) => window.setTimeout(r, 400))
            if (cancelled) return

            const order = await fetchOrderWithItems(orderId)
            if (!order || cancelled) return

            playNewOrderSound()
            onNewOrderRef.current(order)
          })()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setIsLive(true)
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsLive(false)
          console.warn(
            '[realtime] orders channel unavailable — run supabase/migrations/enable_orders_realtime.sql'
          )
        }
      })

    return () => {
      cancelled = true
      listeningRef.current = false
      setIsLive(false)
      window.clearTimeout(readyTimer)
      void supabase.removeChannel(channel)
    }
  }, [enabled])

  return { seedSeenOrders, isLive }
}
