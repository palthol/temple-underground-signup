import CoachCard from '../components/CoachCard'
import SectionHeader from '../components/SectionHeader'
import { useSeo } from '../lib/seo'

const coaches = [
  {
    name: 'Coach Dante',
    role: 'Head Coach',
    bio: 'Competition-tested and systems-minded, Coach Dante integrates breathwork, conditioning, and technical progression into every class block. His coaching style is disciplined, direct, and deeply invested in long-term member growth.',
    specialties: ['Breath Under Pressure', 'Integrated Fight Systems', 'Performance Standards'],
  },
  {
    name: 'Assistant Coach (Placeholder)',
    role: 'Boxing Fundamentals Coach',
    bio: 'Focused on clean mechanics and repeatable defensive habits, this role supports beginner confidence while reinforcing advanced technical details for experienced members.',
    specialties: ['Footwork', 'Defensive Layers', 'Padwork Progression'],
  },
  {
    name: 'Assistant Coach (Placeholder)',
    role: 'BJJ Fundamentals Coach',
    bio: 'Specializes in positional understanding, safe rolling progression, and helping new students become composed in grappling exchanges from day one.',
    specialties: ['Escapes', 'Positional Control', 'Rolling Safety'],
  },
]

export default function CoachesPage() {
  useSeo({
    title: 'Coaches | Temple Underground',
    description: 'Meet the coaching team at Temple Underground and learn our progression-first coaching philosophy.',
    pathname: '/coaches',
  })

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionHeader
        eyebrow="Coaches"
        title="High standards, clear progression, real mentorship"
        description="Our coaching philosophy is simple: protect safety, demand discipline, and help every athlete improve with purpose."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {coaches.map((coach) => (
          <CoachCard key={coach.name + coach.role} {...coach} />
        ))}
      </div>

      <article className="mt-10 rounded-xl border border-temple-charcoal bg-temple-charcoal/30 p-6">
        <h3 className="text-xl font-semibold">Coaching Philosophy</h3>
        <p className="mt-3 text-sm leading-7 text-temple-snow/80">
          We coach for sustainability and performance at the same time. Safety is non-negotiable. Progression is planned. Standards are
          transparent. The room stays respectful and supportive, but nobody is here to drift. Consistency and accountability are expected
          from coaches and members equally.
        </p>
      </article>
    </section>
  )
}
