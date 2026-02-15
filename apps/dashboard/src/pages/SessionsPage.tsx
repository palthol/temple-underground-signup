import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Session = {
  id: string
  starts_at: string
  ends_at: string
  session_label: string | null
}

export function SessionsPage() {
  const [rows, setRows] = useState<Session[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('sessions')
      .select('id, starts_at, ends_at, session_label')
      .order('starts_at', { ascending: false })
      .limit(50)
      .then(({ data, error: e }) => {
        setLoading(false)
        if (e) setError(e.message)
        else setRows((data as Session[]) ?? [])
      })
  }, [])

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Sessions</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Starts</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ends</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{new Date(r.starts_at).toLocaleString()}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{new Date(r.ends_at).toLocaleString()}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.session_label ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="mt-4 text-gray-500">No sessions yet.</p>}
    </div>
  )
}
