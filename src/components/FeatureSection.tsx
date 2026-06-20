const STEPS = [
  {
    num: '١',
    title: 'اختر ما يشتهيك',
    text: 'تصفّح القائمة، اضغط إضافة — بدون تسجيل دخول.',
  },
  {
    num: '٢',
    title: 'أكمل طلبك',
    text: 'أدخل اسمك ورقم طاولتك — ثلاثون ثانية فقط.',
  },
  {
    num: '٣',
    title: 'ادفع بأمان',
    text: 'مدى · فيزا · Apple Pay · STC Pay · أو كاش عند الاستلام.',
  },
] as const

const TRUST = [
  { icon: '🔒', label: 'دفع آمن 100%' },
  { icon: '⚡', label: 'طلب في ثوانٍ' },
  { icon: '📱', label: 'بدون تطبيق' },
  { icon: '🎯', label: 'بدون تسجيل' },
] as const

export function FeatureSection() {
  return (
    <section className="how-section" id="about" aria-labelledby="how-heading">
      <h2 id="how-heading" className="how-section__title">كيف تطلب؟</h2>

      <ol className="how-steps">
        {STEPS.map((s) => (
          <li key={s.num} className="how-step">
            <span className="how-step__num" aria-hidden>{s.num}</span>
            <div className="how-step__body">
              <strong className="how-step__title">{s.title}</strong>
              <p className="how-step__text">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="trust-strip">
        {TRUST.map((t) => (
          <div key={t.label} className="trust-chip">
            <span className="trust-chip__icon" aria-hidden>{t.icon}</span>
            <span className="trust-chip__label">{t.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
