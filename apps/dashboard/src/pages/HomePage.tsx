import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Counts = {
  participants: number
  waivers: number
  accounts: number
  subscriptions: number
  chargesOpen: number
  sessions: number
}

export function HomePage() {
  const [counts, setCounts] = useState<Counts | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [p, w, a, s, c, sess] = await Promise.all([
          supabase.from('participants').select('id', { count: 'exact', head: true }),
          supabase.from('waivers').select('id', { count: 'exact', head: true }),
          supabase.from('accounts').select('id', { count: 'exact', head: true }),
          supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('charges').select('id', { count: 'exact', head: true }).eq('status', 'open'),
          supabase.from('sessions').select('id', { count: 'exact', head: true }),
        ])
        setCounts({
          participants: p.count ?? 0,
          waivers: w.count ?? 0,
          accounts: a.count ?? 0,
          subscriptions: s.count ?? 0,
          chargesOpen: c.count ?? 0,
          sessions: sess.count ?? 0,
        })
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load counts')
      }
    }
    load()
  }, [])

  if (error) return <p className="text-red-600">{error}</p>
  if (!counts) return <p className="text-gray-500">Loading…</p>

  const cards = [
    { label: 'Participants', value: counts.participants },
    { label: 'Waivers', value: counts.waivers },
    { label: 'Accounts', value: counts.accounts },
    { label: 'Active subscriptions', value: counts.subscriptions },
    { label: 'Open charges', value: counts.chargesOpen },
    { label: 'Sessions', value: counts.sessions },
  ]

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-white p-4 shadow border border-gray-200">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
