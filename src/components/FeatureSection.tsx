const TRUST = [
  { icon: '🔒', label: 'دفع آمن 100%' },
  { icon: '⚡', label: 'طلب في ثوانٍ' },
  { icon: '📱', label: 'بدون تطبيق' },
  { icon: '✓', label: 'بدون تسجيل' },
] as const

export function FeatureSection() {
  return (
    <div className="trust-strip trust-strip--standalone" aria-label="مميزات الخدمة">
      {TRUST.map((t) => (
        <div key={t.label} className="trust-chip">
          <span className="trust-chip__icon" aria-hidden>{t.icon}</span>
          <span className="trust-chip__label">{t.label}</span>
        </div>
      ))}
    </div>
  )
}
