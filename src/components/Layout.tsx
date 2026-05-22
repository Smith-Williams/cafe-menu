import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { EVA_BRAND } from '../lib/brand'

export function Layout() {
  const { totalQuantity, addedToast, dismissToast } = useCart()
  const { isOwner, profileReady, session } = useAuth()
  const location = useLocation()

  const showAdminLink = profileReady && session && isOwner

  return (
    <div className="app-shell">
      {addedToast ? (
        <div
          className="cart-toast cart-toast--visible"
          role="status"
          aria-live="polite"
          onClick={dismissToast}
        >
          <span className="cart-toast__ring" aria-hidden>
            <span className="cart-toast__icon">✓</span>
          </span>
          <div className="cart-toast__body">
            <span className="cart-toast__title">أُضيف إلى السلة</span>
            <span className="cart-toast__msg">{addedToast}</span>
          </div>
        </div>
      ) : null}

      <header className="top-nav">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            <span className="brand-mark__letter">E</span>
          </span>
          <span className="brand-wordmark">
            <span className="brand-wordmark__en">{EVA_BRAND.nameEn}</span>
            <span className="brand-wordmark__ar">{EVA_BRAND.nameAr}</span>
          </span>
        </Link>
        <nav className="nav-actions" aria-label="التنقل الرئيسي">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `btn btn-ghost ${isActive ? 'nav-active' : ''}`
            }
          >
            القائمة
          </NavLink>
          <Link
            to="/cart"
            className={`btn btn-primary btn-cart${totalQuantity > 0 ? ' btn-cart--has-items' : ''}`}
          >
            السلة
            {totalQuantity > 0 ? (
              <span className="cart-badge" key={totalQuantity}>
                {totalQuantity}
              </span>
            ) : null}
          </Link>
          {showAdminLink ? (
            <Link to="/admin" className="btn btn-ghost">
              الإدارة
            </Link>
          ) : null}
        </nav>
      </header>

      <main key={location.pathname} className="page-transition">
        <Outlet />
      </main>
    </div>
  )
}
