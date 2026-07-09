export function RouteFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>جاري التحميل…</p>
    </div>
  )
}
