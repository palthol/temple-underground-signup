import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DashboardLayout } from './pages/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { WaiversPage } from './pages/WaiversPage'
import { ParticipantsPage } from './pages/ParticipantsPage'
import { AccountsPage } from './pages/AccountsPage'
import { PlansPage } from './pages/PlansPage'
import { SubscriptionsPage } from './pages/SubscriptionsPage'
import { BillingPage } from './pages/BillingPage'
import { SessionsPage } from './pages/SessionsPage'
import { EntitlementsPage } from './pages/EntitlementsPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="waivers" element={<WaiversPage />} />
        <Route path="participants" element={<ParticipantsPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="entitlements" element={<EntitlementsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
