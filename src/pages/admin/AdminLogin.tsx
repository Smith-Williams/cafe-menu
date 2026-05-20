import { FormEvent, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AdminLogin() {
  const { session, loading, profileReady, isOwner, signIn } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error: err } = await signIn(email.trim(), password)
    setBusy(false)
    if (err) setError(err.message)
  }

  if (loading || !profileReady) {
    return <p className="loading-inline">جاري التحميل…</p>
  }

  if (session && profileReady && isOwner) {
    return <Navigate to={from} replace />
  }

  if (session && profileReady && !isOwner) {
    return (
      <div className="app-shell">
        <div className="panel" style={{ maxWidth: 480, margin: '2rem auto' }}>
          <h2>لا تملك صلاحية المالك</h2>
          <p className="text-muted">
            هذا الحساب غير مفعّل كمالك. اطلب من مدير النظام تفعيل is_owner في Supabase.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            العودة للقائمة
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <section className="page-hero page-hero--compact">
        <h1>تسجيل دخول المالك</h1>
        <p>
          استخدم البريد وكلمة المرور المفعّلة في Supabase Auth. يجب أن يكون حسابك مُعلَماً
          كمالك في جدول ‎profiles‎.
        </p>
      </section>

      <div className="panel" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>الدخول</h2>

        {error ? (
          <div className="error-banner" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            البريد الإلكتروني
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            كلمة المرور
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'جاري الدخول…' : 'دخول'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          للعودة إلى واجهة الزبائن:{' '}
          <Link to="/">القائمة</Link>
        </p>
      </div>
    </div>
  )
}
