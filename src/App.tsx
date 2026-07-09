import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { Layout } from './components/Layout'
import { RouteFallback } from './components/RouteFallback'
import { MenuPage } from './pages/MenuPage'
import { CartPage } from './pages/CartPage'

// Checkout/payment/admin pages: lazy-loaded so the first-visit menu bundle stays small
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })))
const OrderConfirmationPage = lazy(() =>
  import('./pages/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage }))
)
const OrderPaymentCallbackPage = lazy(() =>
  import('./pages/OrderPaymentCallbackPage').then(m => ({ default: m.OrderPaymentCallbackPage }))
)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminGate = lazy(() => import('./pages/admin/AdminGate').then(m => ({ default: m.AdminGate })))

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
                    <Suspense fallback={<RouteFallback />}>
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
                  <Suspense fallback={<RouteFallback />}>
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
