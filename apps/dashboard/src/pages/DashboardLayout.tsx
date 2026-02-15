import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/waivers', label: 'Waivers' },
  { to: '/participants', label: 'Participants' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/plans', label: 'Plans' },
  { to: '/subscriptions', label: 'Subscriptions' },
  { to: '/billing', label: 'Billing' },
  { to: '/sessions', label: 'Sessions' },
  { to: '/entitlements', label: 'Entitlements' },
]

export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-gray-900">
          Temple Underground — Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="flex flex-1">
        <nav className="w-52 bg-white border-r border-gray-200 p-3 space-y-0.5">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm ${isActive ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
