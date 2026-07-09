import { memo, Suspense } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { EVA_BRAND } from '../lib/brand'
import { ErrorBoundary } from './ErrorBoundary'
import { RouteFallback } from './RouteFallback'

const CartIcon = memo(function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12z" />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <path d="M6 6L5 3H2" />
    </svg>
  )
})

export function Layout() {
  const { totalQuantity, addedToast, dismissToast } = useCart()
  const { isOwner, profileReady, session } = useAuth()
  const { settings } = useSettings()
  const location = useLocation()
  const navigate = useNavigate()

  const showAdminLink = profileReady && session && isOwner
  const isHome = location.pathname === '/'
  const brandLabel = settings.cafe_name_ar || EVA_BRAND.nameEn

  return (
    <div className="app-shell">
      {addedToast ? (
        <div
          className="cart-toast cart-toast--visible"
          role="status"
          aria-live="polite"
          onClick={() => {
            dismissToast()
            navigate('/cart')
          }}
        >
          <span className="cart-toast__ring" aria-hidden>
            <span className="cart-toast__icon">✓</span>
          </span>
          <div className="cart-toast__body">
            <span className="cart-toast__title">أُضيف إلى السلة</span>
            <span className="cart-toast__msg">{addedToast}</span>
          </div>
          <span className="cart-toast__cta">عرض السلة ←</span>
        </div>
      ) : null}

      <header className="top-nav">
        <Link to="/" className="brand brand--text">
          {brandLabel}
        </Link>
        <nav className="nav-links" aria-label="التنقل الرئيسي">
          {isHome ? (
            <>
              <a href="#about" className="nav-link">
                من نحن
              </a>
              <a href="#menu" className="nav-link">
                القائمة
              </a>
              <a href="#contact" className="nav-link">
                تواصل
              </a>
            </>
          ) : (
            <NavLink to="/" className="nav-link">
              القائمة
            </NavLink>
          )}
          {showAdminLink ? (
            <Link to="/admin" className="nav-link">
              الإدارة
            </Link>
          ) : null}
        </nav>
        <Link
          to="/cart"
          className={`nav-cart${totalQuantity > 0 ? ' nav-cart--has-items' : ''}`}
          aria-label={`السلة${totalQuantity > 0 ? `، ${totalQuantity} عنصر` : ''}`}
        >
          <CartIcon />
          {totalQuantity > 0 ? (
            <span className="nav-cart__badge" key={totalQuantity}>
              {totalQuantity}
            </span>
          ) : null}
        </Link>
      </header>

      <main key={location.pathname} className="page-transition">
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
