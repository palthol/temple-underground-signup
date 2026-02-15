import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { siteConfig } from '../config/site'
import { useSeo } from '../lib/seo'

const programs = [
  {
    title: 'Boxing',
    forWho: 'Beginners building fundamentals, adults sharpening confidence, and competitors cleaning up details.',
    learn: 'Stance, footwork, defensive layers, padwork, bag rounds, and controlled sparring progression.',
    coaching:
      'We build from clean mechanics to timing under pressure. Coaches control pace and pairings so intensity is earned, not forced.',
  },
  {
    title: 'Brazilian Jiu-Jitsu',
    forWho: 'Students who want technical control, self-defense confidence, and long-term grappling growth.',
    learn: 'Positional hierarchy, escapes, retention, top control, submissions, and live rolling progression.',
    coaching:
      'You learn repeatable systems instead of random techniques. Coaches keep rounds purposeful and safe with clear constraints.',
  },
  {
    title: 'Combat Sports Conditioning',
    forWho: 'Members who need better work capacity, improved resilience, and sport-ready strength-endurance.',
    learn: 'Energy systems, mobility, positional strength, and durable movement patterns for high output.',
    coaching:
      'Conditioning blocks are structured around skill training load so your engine improves without burning out your technique days.',
  },
  {
    title: 'Everything in Between',
    forWho: 'Athletes developing continuity between striking and grappling.',
    learn: 'Clinch entries, takedown awareness, transitions, and movement decisions between phases.',
    coaching:
      'We teach connection points responsibly. No fantasy promises, just practical transitions drilled with progression and control.',
  },
]

export default function ProgramsPage() {
  useSeo({
    title: 'Programs | Temple Underground',
    description:
      'Explore Temple Underground training programs in boxing, BJJ, combat conditioning, and hybrid fundamentals.',
    pathname: '/programs',
  })

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionHeader
        eyebrow="Programs"
        title="Disciplines coached as a complete performance system"
        description="Each program is structured with progression, standards, and coaching attention so members improve safely and consistently."
      />
      <div className="mt-10 space-y-6">
        {programs.map((program) => (
          <article key={program.title} className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6 sm:p-8">
            <h3 className="text-2xl font-semibold">{program.title}</h3>
            <div className="mt-5 grid gap-4 text-sm leading-6 text-temple-snow/82 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-temple-gold">Who it's for</p>
                <p className="mt-2">{program.forWho}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-temple-gold">What you'll learn</p>
                <p className="mt-2">{program.learn}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-temple-gold">How we coach it</p>
                <p className="mt-2">{program.coaching}</p>
              </div>
            </div>
            <Link
              to={siteConfig.cta.primary.href}
              className="focus-ring mt-6 inline-block rounded-md bg-temple-red px-5 py-3 text-sm font-semibold uppercase tracking-wide"
            >
              Book a Trial in {program.title}
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
