import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { Layout } from './components/Layout'
import { MenuPage } from './pages/MenuPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { OrderPaymentCallbackPage } from './pages/OrderPaymentCallbackPage'

// Admin pages: lazy-loaded so customer bundle doesn't include them
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminGate = lazy(() => import('./pages/admin/AdminGate').then(m => ({ default: m.AdminGate })))

function AdminFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>جاري التحميل…</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<MenuPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-confirmation" element={<OrderPaymentCallbackPage />} />
                <Route path="order/:id" element={<OrderConfirmationPage />} />
                <Route
                  path="admin"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminGate>
                        <AdminDashboard />
                      </AdminGate>
                    </Suspense>
                  }
                />
              </Route>

              <Route
                path="/admin/login"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <AdminLogin />
                  </Suspense>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}
