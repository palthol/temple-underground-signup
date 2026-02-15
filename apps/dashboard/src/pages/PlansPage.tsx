import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Plan = {
  id: string
  name: string
  plan_category: string
  billing_cadence: string
  price_cents: number
  is_active: boolean
}

export function PlansPage() {
  const [rows, setRows] = useState<Plan[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('plan_definitions')
      .select('id, name, plan_category, billing_cadence, price_cents, is_active')
      .order('name')
      .then(({ data, error: e }) => {
        setLoading(false)
        if (e) setError(e.message)
        else setRows((data as Plan[]) ?? [])
      })
  }, [])

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Plans</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Billing</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">{r.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.plan_category}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{r.billing_cadence}</td>
                <td className="px-4 py-2 text-sm text-gray-600">${(r.price_cents / 100).toFixed(2)}</td>
                <td className="px-4 py-2 text-sm">{r.is_active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="mt-4 text-gray-500">No plans yet.</p>}
    </div>
  )
}
