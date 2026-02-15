import { Link } from 'react-router-dom'
import { siteConfig } from '../config/site'

export default function Footer() {
  return (
    <footer className="border-t border-temple-charcoal bg-temple-ink">
      <div className="container-shell grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold uppercase tracking-[0.12em]">{siteConfig.business.name}</p>
          <p className="mt-2 text-sm text-temple-snow/70">{siteConfig.business.shortTagline}</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-temple-gold">Contact</p>
          <p className="mt-3 text-sm text-temple-snow/75">{siteConfig.business.addressLine1}</p>
          <p className="text-sm text-temple-snow/75">{siteConfig.business.cityStateZip}</p>
          <p className="mt-2 text-sm text-temple-snow/75">{siteConfig.business.phone}</p>
          <p className="text-sm text-temple-snow/75">{siteConfig.business.email}</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-temple-gold">Quick Links</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-temple-snow/75">
            <Link to="/programs" className="focus-ring rounded hover:text-temple-snow">
              Programs
            </Link>
            <Link to="/schedule-pricing" className="focus-ring rounded hover:text-temple-snow">
              Schedule & Pricing
            </Link>
            <Link to="/contact" className="focus-ring rounded hover:text-temple-snow">
              Book a Trial Class
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
