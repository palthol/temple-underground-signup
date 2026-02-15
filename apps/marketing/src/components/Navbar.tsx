import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { siteConfig } from '../config/site'
import { trackEvent } from '../lib/analytics'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/programs', label: 'Programs' },
  { to: '/schedule-pricing', label: 'Schedule & Pricing' },
  { to: '/coaches', label: 'Coaches' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-temple-charcoal/80 bg-temple-ink/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between">
        <Link to="/" className="focus-ring rounded text-lg font-semibold uppercase tracking-[0.12em]">
          {siteConfig.business.name}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `focus-ring rounded text-sm font-medium transition ${
                  isActive ? 'text-temple-gold' : 'text-temple-snow/75 hover:text-temple-snow'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to={siteConfig.cta.primary.href}
            className="focus-ring rounded-md bg-temple-red px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-temple-red/90"
            onClick={() => trackEvent('cta_click', { location: 'navbar' })}
          >
            {siteConfig.cta.primary.label}
          </Link>
        </nav>

        <button
          type="button"
          className="focus-ring rounded p-2 text-temple-snow md:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-temple-charcoal bg-temple-charcoal/60 md:hidden">
          <div className="container-shell flex flex-col gap-2 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="focus-ring rounded px-2 py-2 text-sm font-medium text-temple-snow/85 hover:text-temple-snow"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to={siteConfig.cta.primary.href}
              className="focus-ring mt-2 rounded-md bg-temple-red px-4 py-2 text-center text-sm font-semibold uppercase tracking-wide"
              onClick={() => {
                trackEvent('cta_click', { location: 'mobile_menu' })
                setOpen(false)
              }}
            >
              {siteConfig.cta.primary.label}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
