import { Dumbbell, HeartPulse, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import CTASection from '../components/CTASection'
import FAQAccordion from '../components/FAQAccordion'
import ProgramCard from '../components/ProgramCard'
import SectionHeader from '../components/SectionHeader'
import TestimonialCard from '../components/TestimonialCard'
import { siteConfig } from '../config/site'
import { useSeo } from '../lib/seo'

const faqs = [
  {
    question: 'Do I need experience to start?',
    answer:
      'No. We coach beginners every week. You get clear structure, partner guidance, and a progression that matches your current level.',
  },
  {
    question: 'Is this just hard conditioning?',
    answer:
      'Conditioning is one pillar. We combine it with breathing control and real technical skill so your fitness supports performance.',
  },
  {
    question: 'Can I train without competing?',
    answer:
      'Absolutely. Many members train for confidence, stress control, and long-term health while still learning authentic martial arts.',
  },
]

export default function HomePage() {
  useSeo({
    title: 'Temple Underground | Coach-Led Boxing, BJJ, and Conditioning',
    description:
      'Train with structure. Temple Underground develops breathing control, real conditioning, and combat skill for beginners through competitors.',
    pathname: '/',
  })

  return (
    <>
      <section className="relative overflow-hidden border-b border-temple-charcoal bg-hero-glow">
        <div className="container-shell py-16 sm:py-24">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold uppercase tracking-[0.14em] text-temple-gold"
          >
            {siteConfig.business.name}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            Train with structure. Move with composure. Perform under pressure.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-2xl text-base leading-7 text-temple-snow/82 sm:text-lg"
          >
            We create warriors and martial artists, not cardio tourists. Every class is built on breathing, conditioning, and skill so
            you become resilient and smarter in motion.
          </motion.p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={siteConfig.cta.primary.href}
              className="focus-ring rounded-md bg-temple-red px-5 py-3 text-sm font-semibold uppercase tracking-wide"
            >
              {siteConfig.cta.primary.label}
            </Link>
            <Link
              to={siteConfig.cta.secondary.href}
              className="focus-ring rounded-md border border-temple-gold/60 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-temple-gold hover:bg-temple-gold/10"
            >
              {siteConfig.cta.secondary.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-shell py-16 sm:py-20">
        <SectionHeader
          eyebrow="Our System"
          title="Breath. Structure. Movement."
          description="Temple Underground classes are layered and instructor-led. Every round has intent, progression, and measurable standards."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6">
            <HeartPulse className="text-temple-gold" />
            <h3 className="mt-4 text-lg font-semibold">Breathing</h3>
            <p className="mt-2 text-sm text-temple-snow/80">
              You learn breath control to lower panic, improve decisions, and stay composed during hard rounds and hard days.
            </p>
          </article>
          <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6">
            <Dumbbell className="text-temple-gold" />
            <h3 className="mt-4 text-lg font-semibold">Conditioning</h3>
            <p className="mt-2 text-sm text-temple-snow/80">
              We build the the body for performance, not mirror metrics. You feel stronger where it counts.
            </p>
          </article>
          <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6">
            <ShieldCheck className="text-temple-gold" />
            <h3 className="mt-4 text-lg font-semibold">Skill</h3>
            <p className="mt-2 text-sm text-temple-snow/80">
              Boxing, BJJ, movement, and fundamentals. Technique first, pressure tested over time.
            </p>
          </article>
        </div>
      </section>

      <section className="container-shell py-16">
        <SectionHeader
          eyebrow="Programs"
          title="Coach-led sessions for every stage"
          description="Nervous beginner, focused adult, active competitor, or parent looking for structure - the coaching framework scales."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <ProgramCard
            title="Boxing"
            description="Sharp fundamentals with layered pressure: stance, movement, defense, and controlled power."
            highlights={['Footwork and ring positioning', 'Padwork and bag rounds', 'Sparring progression with clear standards']}
          />
          <ProgramCard
            title="Brazilian Jiu-Jitsu"
            description="A positional system that builds escapes, control, and submissions without guessing."
            highlights={['Positional hierarchy and mechanics', 'Technical drills + live rounds', 'Safe rolling progression']}
          />
          <ProgramCard
            title="Combat Sports Conditioning"
            description="Build the engine and frame to support real training volume and fast recovery."
            highlights={['Work capacity and strength-endurance', 'Mobility and resilience', 'Energy system development']}
          />
          <ProgramCard
            title="Hybrid Fundamentals"
            description="The links between striking and grappling: entries, clinch, and transitions."
            highlights={['Distance management', 'Clinch control and exits', 'Takedown entry awareness']}
          />
        </div>
      </section>

      <section className="container-shell py-16">
        <SectionHeader
          eyebrow="Proof"
          title="Real outcomes from consistent systems"
          description="Replace random workouts with coached progression and standards you can track."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <TestimonialCard
            quote="I came in anxious and got structure on day one. My conditioning improved, but my confidence changed more."
            name="J. Rivera"
            context="Adult beginner member"
          />
          <TestimonialCard
            quote="Coach Dante runs clean classes with clear expectations. No ego, no chaos, just progress."
            name="M. Collins"
            context="Competition track athlete"
          />
          <TestimonialCard
            quote="I needed a place that respected safety and discipline. Temple Underground delivered both."
            name="S. Patel"
            context="Parent and member"
          />
        </div>
      </section>

      <section className="container-shell py-16">
        <SectionHeader
          eyebrow="First Class"
          title="What to expect in your first class"
          description="You will not be thrown into chaos. You will be coached."
        />
        <div className="mt-8 rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6">
          <ol className="space-y-4 text-sm leading-6 text-temple-snow/82">
            <li>
              <strong className="text-temple-gold">1) Check-in + quick consult:</strong> we ask about goals, training background, and
              any injuries.
            </li>
            <li>
              <strong className="text-temple-gold">2) Guided warm-up + breathing:</strong> you learn how to regulate pace and keep
              composure early.
            </li>
            <li>
              <strong className="text-temple-gold">3) Technical block:</strong> fundamentals in boxing or BJJ with coach feedback and
              partner structure.
            </li>
            <li>
              <strong className="text-temple-gold">4) Controlled conditioning:</strong> performance-focused rounds scaled to your level.
            </li>
          </ol>
        </div>
      </section>

      <section className="container-shell py-16">
        <SectionHeader eyebrow="FAQ" title="Quick answers before you visit" />
        <div className="mt-8">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section className="container-shell pb-20">
        <CTASection
          title="Train where standards stay high and coaching stays personal."
          description="Book your trial class and get a clear path from day one."
          primaryLabel={siteConfig.cta.primary.label}
          primaryHref={siteConfig.cta.primary.href}
          secondaryLabel={siteConfig.cta.secondary.label}
          secondaryHref={siteConfig.cta.secondary.href}
        />
      </section>
    </>
  )
}
