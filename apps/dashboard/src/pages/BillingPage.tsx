import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Charge = {
  id: string
  account_id: string
  amount_cents: number
  coverage_start: string
  coverage_end: string
  due_at: string
  status: string
}

export function BillingPage() {
  const [charges, setCharges] = useState<Charge[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateMessage, setGenerateMessage] = useState<string | null>(null)

  function loadCharges() {
    setLoading(true)
    supabase
      .from('charges')
      .select('id, account_id, amount_cents, coverage_start, coverage_end, due_at, status')
      .order('due_at', { ascending: false })
      .limit(50)
      .then(({ data, error: e }) => {
        setLoading(false)
        if (e) setError(e.message)
        else setCharges((data as Charge[]) ?? [])
      })
  }

  useEffect(() => {
    loadCharges()
  }, [])

  async function handleGenerateCharges() {
    setGenerating(true)
    setGenerateMessage(null)
    const { data, error: e } = await supabase.rpc('generate_monthly_charges')
    setGenerating(false)
    if (e) {
      setGenerateMessage(`Error: ${e.message}`)
    } else {
      const created = Array.isArray(data) ? data.length : 0
      setGenerateMessage(created === 0 ? 'No new charges created (none due or already exist).' : `Created ${created} charge(s).`)
      loadCharges()
    }
  }

  if (loading && charges.length === 0) return <p className="text-gray-500">Loading…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Billing</h1>
      <div className="mb-4 flex items-center gap-4">
        <button
          type="button"
          onClick={handleGenerateCharges}
          disabled={generating}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? 'Running…' : 'Generate monthly charges'}
        </button>
        {generateMessage && (
          <span className="text-sm text-gray-600">{generateMessage}</span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-2">Charges (last 50)</p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {charges.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">${(r.amount_cents / 100).toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.coverage_start} → {r.coverage_end}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.due_at}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={r.status === 'open' ? 'text-amber-700' : r.status === 'paid' ? 'text-green-700' : 'text-gray-500'}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {charges.length === 0 && <p className="mt-4 text-gray-500">No charges yet.</p>}
    </div>
  )
}
