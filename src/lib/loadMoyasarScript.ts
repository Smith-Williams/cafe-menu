const MOYASAR_SCRIPT = 'https://cdn.moyasar.com/mpf/0.3.0/moyasar.min.js'

let loadPromise: Promise<void> | null = null

export function loadMoyasarScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.Moyasar) return Promise.resolve()

  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${MOYASAR_SCRIPT}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Moyasar script failed')))
      if (window.Moyasar) resolve()
      return
    }
    const s = document.createElement('script')
    s.src = MOYASAR_SCRIPT
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('تعذّر تحميل مكتبة الدفع'))
    document.head.appendChild(s)
  })

  return loadPromise
}
