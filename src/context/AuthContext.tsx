import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextValue = {
  session: Session | null
  user: User | null
  isOwner: boolean
  loading: boolean
  profileReady: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileReady, setProfileReady] = useState(false)

  const refreshProfile = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setIsOwner(false)
      setProfileReady(true)
      return
    }
    setProfileReady(false)
    const { data, error } = await supabase
      .from('profiles')
      .select('is_owner')
      .eq('id', uid)
      .maybeSingle()

    if (error || !data) {
      setIsOwner(false)
    } else {
      setIsOwner(Boolean(data.is_owner))
    }
    setProfileReady(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const uid = session?.user?.id
    void refreshProfile(uid)
  }, [session?.user?.id, refreshProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setIsOwner(false)
    setProfileReady(true)
  }, [])

  const refreshProfilePublic = useCallback(async () => {
    await refreshProfile(session?.user?.id)
  }, [refreshProfile, session?.user?.id])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isOwner,
      loading,
      profileReady,
      signIn,
      signOut,
      refreshProfile: refreshProfilePublic,
    }),
    [
      session,
      isOwner,
      loading,
      profileReady,
      signIn,
      signOut,
      refreshProfilePublic,
    ]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
