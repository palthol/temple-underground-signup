import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Sub = {
  id: string
  account_id: string
  participant_id: string
  plan_definition_id: string
  status: string
  starts_at: string
  ends_at: string | null
}

export function SubscriptionsPage() {
  const [rows, setRows] = useState<Sub[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('subscriptions')
      .select('id, account_id, participant_id, plan_definition_id, status, starts_at, ends_at')
      .order('starts_at', { ascending: false })
      .then(({ data, error: e }) => {
        setLoading(false)
        if (e) setError(e.message)
        else setRows((data as Sub[]) ?? [])
      })
  }, [])

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Subscriptions</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Starts</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ends</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-sm">
                  <span className={r.status === 'active' ? 'text-green-700' : 'text-gray-500'}>{r.status}</span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.starts_at}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.ends_at ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="mt-4 text-gray-500">No subscriptions yet.</p>}
    </div>
  )
}
