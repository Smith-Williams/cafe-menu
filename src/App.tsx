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
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminGate } from './pages/admin/AdminGate'

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
                  <AdminGate>
                    <AdminDashboard />
                  </AdminGate>
                }
              />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BrowserRouter>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}
