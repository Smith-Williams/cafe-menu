import { Link, NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export function Layout() {
  const { totalQuantity, addedToast, dismissToast } = useCart()

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
          <span className="brand-mark" aria-hidden />
          <span className="brand-text">مقهى الدُّفء</span>
        </Link>
        <nav className="nav-actions" aria-label="التنقل الرئيسي">
          <NavLink to="/" end className={({ isActive }) => `btn btn-ghost ${isActive ? 'active' : ''}`}>
            القائمة
          </NavLink>
          <Link to="/cart" className="btn btn-primary">
            السلة
            {totalQuantity > 0 ? (
              <span className="cart-badge">{totalQuantity}</span>
            ) : null}
          </Link>
          <Link to="/admin" className="btn btn-ghost">
            لوحة المالك
          </Link>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
