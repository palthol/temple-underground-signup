import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type WaiverDoc = {
  waiver_id: string
  participant_id: string
  participant_full_name: string | null
  participant_email: string | null
  signed_at_utc: string | null
  review_confirm_accuracy: boolean | null
}

export function WaiversPage() {
  const [rows, setRows] = useState<WaiverDoc[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('view_waiver_documents')
      .select('waiver_id, participant_id, participant_full_name, participant_email, signed_at_utc, review_confirm_accuracy')
      .order('signed_at_utc', { ascending: false })
      .then(({ data, error: e }) => {
        setLoading(false)
        if (e) setError(e.message)
        else setRows((data as WaiverDoc[]) ?? [])
      })
  }, [])

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Waivers</h1>
      <p className="text-sm text-gray-500 mb-4">From view_waiver_documents</p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Signed at</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Review OK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={`${r.waiver_id}-${r.participant_id}`}>
                <td className="px-4 py-2 text-sm text-gray-900">{r.participant_full_name ?? '—'}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.participant_email ?? '—'}</td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {r.signed_at_utc ? new Date(r.signed_at_utc).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-2 text-sm">{r.review_confirm_accuracy ? 'Yes' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="mt-4 text-gray-500">No waivers yet.</p>}
    </div>
  )
}
