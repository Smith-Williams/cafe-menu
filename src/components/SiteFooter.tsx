import { useMemo } from 'react'
import { useSettings } from '../context/SettingsContext'
import { EVA_BRAND } from '../lib/brand'
import {
  formatPhoneDisplay,
  toTelHref,
  toWhatsAppHref,
} from '../lib/contactLinks'

export function SiteFooter() {
  const { settings } = useSettings()
  const cafeName = settings.cafe_name_ar || EVA_BRAND.nameAr
  const hours = settings.business_hours?.trim() || EVA_BRAND.hours
  const phoneLabel = formatPhoneDisplay(settings.phone_display, settings.phone_tel)
  const telHref = toTelHref(settings.phone_tel)
  const address = settings.address_ar?.trim()
  const mapsUrl = settings.maps_url?.trim()
  const instagramUrl = settings.instagram_url?.trim()

  const whatsappHref = useMemo(
    () =>
      toWhatsAppHref(
        settings.whatsapp_number,
        `مرحباً ${cafeName}، أود الاستفسار عن…`
      ),
    [settings.whatsapp_number, cafeName]
  )

  return (
    <footer className="site-footer" id="contact">
      <div className="site-footer__inner">
        <div className="site-footer__info">
          <p className="site-footer__welcome">ننتظركم بكل حب!</p>
          <p className="site-footer__hours">{hours}</p>
          {phoneLabel && telHref ? (
            <a href={telHref} className="site-footer__phone" dir="ltr">
              {phoneLabel}
            </a>
          ) : phoneLabel ? (
            <p className="site-footer__phone" dir="ltr">
              {phoneLabel}
            </p>
          ) : null}
          {address ? (
            mapsUrl ? (
              <a
                href={mapsUrl}
                className="site-footer__address"
                target="_blank"
                rel="noopener noreferrer"
              >
                {address}
              </a>
            ) : (
              <p className="site-footer__address">{address}</p>
            )
          ) : null}
          <div className="site-footer__social" aria-label="وسائل التواصل">
            {instagramUrl ? (
              <a
                href={instagramUrl}
                className="social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="إنستغرام"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            ) : null}
            {whatsappHref ? (
              <a
                href={whatsappHref}
                className="social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="واتساب"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z" />
                </svg>
              </a>
            ) : null}
            {telHref ? (
              <a href={telHref} className="social-btn" aria-label="اتصال">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M6.5 4h3l2 5-2 1.5a11 11 0 005 5L16 13.5l5 2v3a2 2 0 01-2 2A14 14 0 014 6.5a2 2 0 012-2.5z" />
                </svg>
              </a>
            ) : null}
            {mapsUrl ? (
              <a
                href={mapsUrl}
                className="social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="الموقع على الخريطة"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </a>
            ) : null}
          </div>
          <p className="site-footer__brand">{cafeName}</p>
        </div>

        <div className="site-footer__form-wrap">
          <h2 className="site-footer__form-title">تواصل معنا</h2>
          <p className="site-footer__contact-lead">
            للاستفسارات والحجوزات، راسلنا مباشرة على واتساب — نرد في أقرب وقت.
          </p>
          <div className="site-footer__cta-stack">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                className="btn btn-primary btn-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                مراسلة واتساب
              </a>
            ) : null}
            {telHref ? (
              <a href={telHref} className="btn btn-ghost btn-block">
                اتصال هاتفي
              </a>
            ) : null}
            {mapsUrl ? (
              <a
                href={mapsUrl}
                className="btn btn-ghost btn-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                فتح الموقع على الخريطة
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
