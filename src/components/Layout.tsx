import { Link, NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'

export function Layout() {
  const { totalQuantity, addedToast, dismissToast } = useCart()
  const { isOwner, profileReady, session } = useAuth()
  const { settings } = useSettings()

  const showAdminLink = profileReady && session && isOwner

  return (
    <div className="app-shell">
      {addedToast ? (
        <div className="cart-toast" role="status" onClick={dismissToast}>
          <span className="cart-toast__icon" aria-hidden>
            ✓
          </span>
          {addedToast}
        </div>
      ) : null}
      <header className="top-nav">
        <Link to="/" className="brand">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="" className="brand-logo" />
          ) : (
            <span className="brand-mark" aria-hidden />
          )}
          <span className="brand-text">{settings.cafe_name_ar}</span>
        </Link>
        <nav className="nav-actions" aria-label="التنقل الرئيسي">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `btn btn-ghost ${isActive ? 'nav-active' : ''}`}
          >
            القائمة
          </NavLink>
          <Link to="/cart" className="btn btn-primary">
            السلة
            {totalQuantity > 0 ? (
              <span className="cart-badge">{totalQuantity}</span>
            ) : null}
          </Link>
          {showAdminLink ? (
            <Link to="/admin" className="btn btn-ghost">
              الإدارة
            </Link>
          ) : null}
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
