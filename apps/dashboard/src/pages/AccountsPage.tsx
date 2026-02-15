import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Account = {
  id: string
  status: string
  primary_contact_name: string | null
  primary_contact_email: string | null
  created_at: string
}

export function AccountsPage() {
  const [rows, setRows] = useState<Account[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('accounts')
      .select('id, status, primary_contact_name, primary_contact_email, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        setLoading(false)
        if (e) setError(e.message)
        else setRows((data as Account[]) ?? [])
      })
  }, [])

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Accounts</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-sm">
                  <span className={r.status === 'active' ? 'text-green-700' : 'text-gray-500'}>{r.status}</span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{r.primary_contact_name ?? '—'}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.primary_contact_email ?? '—'}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="mt-4 text-gray-500">No accounts yet.</p>}
    </div>
  )
}
