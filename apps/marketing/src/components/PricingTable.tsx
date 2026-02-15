import { siteConfig } from '../config/site'

export default function PricingTable() {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6">
        <h3 className="text-xl font-semibold">Membership Options</h3>
        <p className="mt-2 text-sm text-temple-snow/80">Drop-in: {siteConfig.pricing.dropIn}</p>
        <div className="mt-4 space-y-3">
          {siteConfig.pricing.monthly.map((plan) => (
            <div key={plan.tier} className="rounded-lg border border-temple-charcoal bg-temple-ink/60 p-4">
              <p className="text-base font-semibold text-temple-gold">{plan.tier}</p>
              <p className="mt-1 text-sm font-medium">{plan.label}</p>
              <p className="mt-1 text-sm text-temple-snow/75">{plan.detail}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6">
        <h3 className="text-xl font-semibold">Private Coaching Add-Ons</h3>
        <p className="mt-2 text-sm text-temple-snow/75">
          Add focused 1:1 coaching blocks for technical correction or prep.
        </p>
        <div className="mt-4 space-y-3">
          {siteConfig.pricing.privateAddOns.map((item) => (
            <div key={item.tier} className="rounded-lg border border-temple-charcoal bg-temple-ink/60 p-4">
              <p className="text-base font-semibold text-temple-gold">{item.tier}</p>
              <p className="mt-1 text-sm text-temple-snow/75">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-temple-snow/75">{siteConfig.pricing.familyNote}</p>
      </article>
    </section>
  )
}
