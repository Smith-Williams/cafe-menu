import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AdminGate({ children }: { children: ReactNode }) {
  const { session, isOwner, loading, profileReady } = useAuth()
  const location = useLocation()

  if (loading || !profileReady) {
    return <p className="loading-inline">جاري التحميل…</p>
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (!isOwner) {
    return (
      <div className="panel" style={{ marginTop: '1rem' }}>
        <h2>لا تملك صلاحية المالك</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          حسابك مسجّل لكن ‎is_owner‎ غير مفعّل. في محرر SQL في Supabase نفّذ:
        </p>
        <pre
          style={{
            background: 'rgba(0,0,0,0.25)',
            padding: '0.75rem',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '0.85rem',
          }}
        >
          {`update public.profiles\nset is_owner = true\nwhere id = '<معرف المستخدم>';`}
        </pre>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          معرف المستخدم يظهر في لوحة Authentication → Users.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
