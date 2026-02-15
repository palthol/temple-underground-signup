import { Link } from 'react-router-dom'
import { siteConfig } from '../config/site'
import { trackEvent } from '../lib/analytics'

export default function StickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-temple-charcoal bg-temple-ink/95 p-3 backdrop-blur md:hidden">
      <Link
        to={siteConfig.cta.primary.href}
        className="focus-ring block rounded-md bg-temple-red px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-temple-snow"
        onClick={() => trackEvent('cta_click', { location: 'sticky_mobile' })}
      >
        {siteConfig.cta.stickyMobileLabel}
      </Link>
    </div>
  )
}
