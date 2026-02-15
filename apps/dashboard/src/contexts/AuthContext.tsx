import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

/** Error from sign-in: message plus optional HTTP status from Supabase Auth. */
export type AuthError = { message: string; status?: number }

type AuthState = {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function toAuthError(err: unknown): AuthError {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    const o = err as { message: string; status?: number }
    return { message: o.message, status: o.status }
  }
  return { message: err instanceof Error ? err.message : 'Sign in failed' }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      const { data, error } = result
      setSession(data?.session ?? null)
      setLoading(false)
      if (error) {
        console.error('[Auth] getSession error:', error.message)
      }
    }).catch((err) => {
      console.error('[Auth] getSession threw:', err)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    if (!trimmedEmail || !trimmedPassword) {
      return { error: { message: 'Email and password are required' } }
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password: trimmedPassword })
      if (error) {
        const authError: AuthError = { message: error.message }
        if (typeof (error as { status?: number }).status === 'number') {
          authError.status = (error as { status: number }).status
        }
        return { error: authError }
      }
      if (!data.session) {
        return { error: { message: 'No session returned' } }
      }
      return { error: null }
    } catch (err) {
      console.error('[Auth] signInWithPassword threw:', err)
      return { error: toAuthError(err) }
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
