import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type EntitlementRow = {
  participant_id: string
  subscription_id: string
  entitlement_id: string
  scope: string
  unit: string
  limit_type: string
  entitlement_limit: number | null
  reset_rule: string | null
  sessions_used: number
  minutes_used: number
  credits_available: number
  has_availability: boolean
  remaining: number | null
}

export function EntitlementsPage() {
  const [rows, setRows] = useState<EntitlementRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('participant_entitlement_status')
      .select('participant_id, subscription_id, entitlement_id, scope, unit, limit_type, entitlement_limit, reset_rule, sessions_used, minutes_used, credits_available, has_availability, remaining')
      .then(({ data, error: e }) => {
        setLoading(false)
        if (e) setError(e.message)
        else setRows((data as EntitlementRow[]) ?? [])
      })
  }, [])

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Entitlement status</h1>
      <p className="text-sm text-gray-500 mb-4">From participant_entitlement_status view</p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Scope</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Limit</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Used</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((r, i) => (
              <tr key={`${r.participant_id}-${r.entitlement_id}-${i}`}>
                <td className="px-4 py-2 text-sm text-gray-900">{r.scope}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.unit}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.limit_type === 'unlimited' ? '∞' : r.entitlement_limit ?? '—'}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.scope === 'group' ? r.sessions_used : r.minutes_used}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.credits_available}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={r.has_availability ? 'text-green-700' : 'text-gray-500'}>
                    {r.has_availability ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.remaining ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="mt-4 text-gray-500">No entitlement rows (no active subscriptions with entitlements).</p>}
    </div>
  )
}
