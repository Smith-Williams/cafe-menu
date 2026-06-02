const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M8 38h32M12 38V22a12 12 0 0124 0v16" />
        <path d="M18 14h12M24 8v6" />
        <rect x="14" y="22" width="20" height="8" rx="2" />
      </svg>
    ),
    title: 'مقهىٌ مميز',
    text: 'أجواء دافئة وفاخرة — مكانٌ مثالي للقاءات واللحظات الهادئة.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M10 20c0-6 5-10 14-10s14 4 14 10-5 10-14 10H10" />
        <path d="M10 20v14h14c9 0 14-4 14-10" />
        <ellipse cx="24" cy="34" rx="8" ry="3" />
      </svg>
    ),
    title: 'حبوب مختارة',
    text: 'نختار أجود الحبوب ونحمّصها بعناية لنكهة غنية ومتوازنة.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M24 8c-6 0-10 4-10 10 0 8 10 14 10 22 0-8 10-14 10-22 0-6-4-10-10-10z" />
        <path d="M18 28c2 2 4 3 6 3s4-1 6-3" />
      </svg>
    ),
    title: 'فن اللاتيه',
    text: 'باريستا محترفون يصنعون كل كوب بشغف وإتقان.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <circle cx="24" cy="16" r="6" />
        <path d="M12 40c0-8 5-14 12-14s12 6 12 14" />
        <path d="M30 12l4-4M18 12l-4-4" />
      </svg>
    ),
    title: 'فريق محترف',
    text: 'خدمة ودودة واهتمام بالتفاصيل في كل زيارة.',
  },
] as const

export function FeatureSection() {
  return (
    <section className="features" id="about" aria-labelledby="features-heading">
      <h2 id="features-heading" className="visually-hidden">
        لماذا إيفا كافيه
      </h2>
      <div className="features__grid">
        {FEATURES.map((f) => (
          <article key={f.title} className="feature-card">
            <div className="feature-card__icon">{f.icon}</div>
            <h3 className="feature-card__title">{f.title}</h3>
            <p className="feature-card__text">{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
