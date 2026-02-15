import { Link } from 'react-router-dom'

interface CTASectionProps {
  title: string
  description: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

export default function CTASection({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <section className="rounded-2xl border border-temple-charcoal bg-gradient-to-r from-temple-charcoal to-temple-shadow p-8 shadow-soft sm:p-10">
      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 max-w-3xl text-temple-snow/80">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={primaryHref}
          className="focus-ring rounded-md bg-temple-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-temple-snow transition hover:bg-temple-red/90"
        >
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            to={secondaryHref}
            className="focus-ring rounded-md border border-temple-gold/50 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-temple-gold transition hover:border-temple-gold hover:bg-temple-gold/10"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </section>
  )
}
