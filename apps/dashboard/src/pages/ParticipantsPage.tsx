import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Participant = {
  id: string
  full_name: string
  email: string
  date_of_birth: string
  created_at: string
}

export function ParticipantsPage() {
  const [rows, setRows] = useState<Participant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('participants')
      .select('id, full_name, email, date_of_birth, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        setLoading(false)
        if (e) setError(e.message)
        else setRows((data as Participant[]) ?? [])
      })
  }, [])

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Participants</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{r.full_name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.email}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.date_of_birth}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="mt-4 text-gray-500">No participants yet.</p>}
    </div>
  )
}
