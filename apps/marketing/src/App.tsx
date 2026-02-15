import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AboutPage from './pages/AboutPage'
import CoachesPage from './pages/CoachesPage'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProgramsPage from './pages/ProgramsPage'
import SchedulePricingPage from './pages/SchedulePricingPage'
import { LocalBusinessSchema } from './lib/seo'

export default function App() {
  return (
    <>
      <LocalBusinessSchema />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="schedule-pricing" element={<SchedulePricingPage />} />
          <Route path="coaches" element={<CoachesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
