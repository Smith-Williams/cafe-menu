import { FormEvent, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { EVA_BRAND } from '../lib/brand'

export function SiteFooter() {
  const { settings } = useSettings()
  const [sent, setSent] = useState(false)
  const cafeName = settings.cafe_name_ar || EVA_BRAND.nameAr

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <footer className="site-footer" id="contact">
      <div className="site-footer__inner">
        <div className="site-footer__info">
          <p className="site-footer__welcome">ننتظركم بكل حب!</p>
          <p className="site-footer__hours">{EVA_BRAND.hours}</p>
          <a href={`tel:${EVA_BRAND.phoneTel}`} className="site-footer__phone" dir="ltr">
            {EVA_BRAND.phone}
          </a>
          <div className="site-footer__social" aria-label="وسائل التواصل">
            <a href="#" className="social-btn" aria-label="إنستغرام">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" className="social-btn" aria-label="واتساب">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z" />
              </svg>
            </a>
            <a href={`tel:${EVA_BRAND.phoneTel}`} className="social-btn" aria-label="اتصال">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M6.5 4h3l2 5-2 1.5a11 11 0 005 5L16 13.5l5 2v3a2 2 0 01-2 2A14 14 0 014 6.5a2 2 0 012-2.5z" />
              </svg>
            </a>
          </div>
          <p className="site-footer__brand">{cafeName}</p>
        </div>

        <div className="site-footer__form-wrap">
          <h2 className="site-footer__form-title">تواصل معنا</h2>
          {sent ? (
            <p className="site-footer__thanks" role="status">
              شكراً لتواصلكم — سنرد عليكم قريباً.
            </p>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <label className="field">
                <span className="field__label">الاسم</span>
                <input type="text" name="name" className="field__input" required />
              </label>
              <label className="field">
                <span className="field__label">رقم الجوال</span>
                <input
                  type="tel"
                  name="phone"
                  className="field__input"
                  dir="ltr"
                  required
                />
              </label>
              <label className="field">
                <span className="field__label">تعليق</span>
                <textarea name="message" className="field__input" rows={4} />
              </label>
              <button type="submit" className="btn btn-primary btn-block">
                إرسال
              </button>
            </form>
          )}
        </div>
      </div>
    </footer>
  )
}
