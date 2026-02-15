import SectionHeader from '../components/SectionHeader'
import { useSeo } from '../lib/seo'

export default function AboutPage() {
  useSeo({
    title: 'About & Philosophy | Temple Underground',
    description:
      'Learn the Temple Underground training philosophy: composure, discipline, resilience, and coach-led progression.',
    pathname: '/about',
  })

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionHeader
        eyebrow="Philosophy"
        title="Warrior mindset, modern coaching environment"
        description="At Temple Underground, warrior means composed under pressure, disciplined in practice, and respectful in community."
      />

      <article className="mt-10 rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6 sm:p-8">
        <h3 className="text-2xl font-semibold">What we expect from members</h3>
        <ul className="mt-5 space-y-3 text-sm leading-7 text-temple-snow/82">
          <li>
            - <strong className="text-temple-gold">Respect:</strong> for training partners, coaches, and the process.
          </li>
          <li>
            - <strong className="text-temple-gold">Consistency:</strong> progress comes from repeated quality effort, not occasional
            intensity.
          </li>
          <li>
            - <strong className="text-temple-gold">Humility:</strong> leave ego at the door and stay coachable.
          </li>
          <li>
            - <strong className="text-temple-gold">Accountability:</strong> show up prepared, recover properly, and own your standards.
          </li>
        </ul>
      </article>

      <article className="mt-8 rounded-xl border border-temple-charcoal bg-temple-charcoal/30 p-6 sm:p-8">
        <h3 className="text-2xl font-semibold">Why we are different from typical gyms</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-temple-charcoal bg-temple-ink/55 p-4">
            <p className="text-sm font-semibold text-temple-gold">Typical Experience</p>
            <ul className="mt-3 space-y-2 text-sm text-temple-snow/75">
              <li>- Random class intensity and unclear progression</li>
              <li>- Training focused on sweat, not skill transfer</li>
              <li>- Minimal coaching feedback per session</li>
            </ul>
          </div>
          <div className="rounded-lg border border-temple-gold/30 bg-temple-gold/10 p-4">
            <p className="text-sm font-semibold text-temple-gold">Temple Underground</p>
            <ul className="mt-3 space-y-2 text-sm text-temple-snow/85">
              <li>- Structured curriculum with clear standards and phases</li>
              <li>- Breath, conditioning, and skill trained as one system</li>
              <li>- Coach-led corrections and scalable progressions every class</li>
            </ul>
          </div>
        </div>
      </article>
    </section>
  )
}
