import { useSettings } from '../context/SettingsContext'
import { EVA_BRAND } from '../lib/brand'

export function SiteHero() {
  const { settings } = useSettings()
  const title = settings.cafe_name_ar || EVA_BRAND.nameAr
  const tagline = settings.tagline_ar || EVA_BRAND.taglineAr

  return (
    <section className="landing-hero" id="top">
      <div className="landing-hero__content">
        <p className="landing-hero__brand-en">{EVA_BRAND.nameEn}</p>
        <h1 className="landing-hero__title">{title}</h1>
        <p className="landing-hero__tagline">{tagline}</p>
        <a href="#menu" className="btn btn-primary btn-hero">
          تصفّح القائمة
        </a>
      </div>
      <div className="landing-hero__visual">
        <img
          src="/hero-coffee.png"
          alt=""
          className="landing-hero__image"
          width={640}
          height={640}
          fetchPriority="high"
        />
      </div>
    </section>
  )
}
