import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { AuthError } from '../contexts/AuthContext'
import { supabaseUrlHint } from '../lib/supabase'

export function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<AuthError | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (import.meta.env.DEV) {
      console.log('[Login] submit', { email: email.trim(), hasPassword: password.length > 0 })
    }
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Temple Underground</h1>
        <p className="text-sm text-gray-500 mb-6">Dashboard — sign in as admin</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded px-3 py-2 space-y-1">
              <p>{error.message}</p>
              {error.status != null && (
                <p className="text-xs text-red-500">HTTP {error.status}</p>
              )}
            </div>
          )}
          {import.meta.env.DEV && supabaseUrlHint && (
            <p className="text-xs text-gray-400 mt-2" title="Supabase project host (dev only)">
              Supabase: {supabaseUrlHint}
              {' · '}
              401 = wrong email/password or no password set. Reset link goes to wrong URL? Set Auth → URL Configuration to <code className="bg-gray-100 px-0.5">http://localhost:5174</code>.
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          {import.meta.env.DEV && loading && (
            <p className="text-xs text-gray-500 mt-2">Signing in as <strong>{email.trim() || '—'}</strong>…</p>
          )}
        </form>
      </div>
    </div>
  )
}
