const MOYASAR_VERSION = '1.14.0'
const MOYASAR_BASE = `https://cdn.moyasar.com/mpf/${MOYASAR_VERSION}`
const MOYASAR_JS = `${MOYASAR_BASE}/moyasar.js`
const MOYASAR_CSS = `${MOYASAR_BASE}/moyasar.css`

const ATTR = 'data-eva-moyasar'

let loadPromise: Promise<void> | null = null

function removeLegacyMoyasarTags() {
  document.querySelectorAll(`script[${ATTR}]`).forEach((el) => {
    if ((el as HTMLScriptElement).getAttribute(ATTR) !== MOYASAR_VERSION) el.remove()
  })
  document.querySelectorAll(`script[src*="cdn.moyasar.com/mpf/"]`).forEach((el) => {
    const src = (el as HTMLScriptElement).src || ''
    if (src.includes('cdn.moyasar.com/mpf/') && !src.includes(`/mpf/${MOYASAR_VERSION}/`)) {
      el.remove()
    }
  })
  document.querySelectorAll(`link[href*="cdn.moyasar.com/mpf/"]`).forEach((el) => {
    const href = (el as HTMLLinkElement).href || ''
    if (href.includes('cdn.moyasar.com/mpf/') && !href.includes(`/mpf/${MOYASAR_VERSION}/`)) {
      el.remove()
    }
  })
}

function loadStylesheet(): Promise<void> {
  const selector = `link[${ATTR}="${MOYASAR_VERSION}-css"]`
  if (document.querySelector(selector)) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = MOYASAR_CSS
    link.setAttribute(ATTR, `${MOYASAR_VERSION}-css`)
    link.onload = () => resolve()
    link.onerror = () => reject(new Error('تعذّر تحميل أنماط Moyasar'))
    document.head.appendChild(link)
  })
}

function loadScript(): Promise<void> {
  if (window.Moyasar) return Promise.resolve()

  const selector = `script[${ATTR}="${MOYASAR_VERSION}"]`
  const existing = document.querySelector<HTMLScriptElement>(selector)
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.Moyasar) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('فشل تحميل Moyasar')))
    })
  }

  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = MOYASAR_JS
    s.async = true
    s.setAttribute(ATTR, MOYASAR_VERSION)
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('تعذّر تحميل مكتبة Moyasar'))
    document.head.appendChild(s)
  })
}

/** Load Moyasar.js + moyasar.css from official CDN (required for v1.x form). */
export function loadMoyasarScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.Moyasar) return Promise.resolve()

  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    try {
      removeLegacyMoyasarTags()
      await loadStylesheet()
      await loadScript()
      if (!window.Moyasar) {
        throw new Error('مكتبة Moyasar لم تُعرّف بعد التحميل')
      }
    } catch (e) {
      loadPromise = null
      throw e
    }
  })()

  return loadPromise
}
