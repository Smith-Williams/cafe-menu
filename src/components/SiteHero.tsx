import { useSettings } from '../context/SettingsContext'
import { EVA_BRAND } from '../lib/brand'
import { HeroVisual } from './HeroVisual'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'صباح الخير ☀️'
  if (h >= 12 && h < 17) return 'ظهيرة طيبة 🌤'
  if (h >= 17 && h < 21) return 'مساء النور 🌆'
  return 'ليلة طيبة 🌙'
}

export function SiteHero() {
  const { settings } = useSettings()
  const title = settings.cafe_name_ar || EVA_BRAND.nameAr
  const tagline = settings.tagline_ar || EVA_BRAND.taglineAr
  const greeting = getGreeting()

  return (
    <section className="landing-hero" id="top">
      <div className="landing-hero__ambient" aria-hidden />
      <div className="landing-hero__content">
        <p className="landing-hero__greeting">{greeting}</p>
        <p className="landing-hero__brand-en">{EVA_BRAND.nameEn}</p>
        <div className="landing-hero__rule" aria-hidden />
        <h1 className="landing-hero__title">{title}</h1>
        <p className="landing-hero__tagline">{tagline}</p>
        <div className="landing-hero__actions">
          <a href="#menu" className="btn btn-primary btn-hero">
            تصفّح القائمة
          </a>
          <a href="#about" className="btn btn-ghost btn-hero-secondary">
            كيف تطلب؟
          </a>
        </div>
      </div>
      <HeroVisual />
    </section>
  )
}
