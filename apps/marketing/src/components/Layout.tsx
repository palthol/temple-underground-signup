import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'
import StickyCTA from './StickyCTA'

export default function Layout() {
  return (
    <div className="min-h-screen bg-temple-ink pb-20 md:pb-0">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <StickyCTA />
    </div>
  )
}
