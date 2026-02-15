import CTASection from '../components/CTASection'
import PricingTable from '../components/PricingTable'
import ScheduleTable from '../components/ScheduleTable'
import SectionHeader from '../components/SectionHeader'
import { siteConfig } from '../config/site'
import { useSeo } from '../lib/seo'

export default function SchedulePricingPage() {
  useSeo({
    title: 'Schedule & Pricing | Temple Underground',
    description:
      'View Temple Underground class times, open mat schedule, membership tiers, and private coaching options.',
    pathname: '/schedule-pricing',
  })

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionHeader
        eyebrow="Schedule & Pricing"
        title="Clear training times. Flexible tiers. No confusion."
        description="Choose a plan that matches your training frequency and goals, then commit to the system."
      />

      <div className="mt-8">
        <ScheduleTable />
      </div>

      <div className="mt-10">
        <PricingTable />
      </div>

      <div className="mt-12">
        <CTASection
          title="Not sure which tier fits you?"
          description="Book a trial class first. We will recommend a path based on your schedule, recovery, and goals."
          primaryLabel={siteConfig.cta.primary.label}
          primaryHref={siteConfig.cta.primary.href}
        />
      </div>
    </section>
  )
}
