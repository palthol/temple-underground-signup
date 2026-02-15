import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ProgramCardProps {
  title: string
  description: string
  highlights: string[]
}

export default function ProgramCard({ title, description, highlights }: ProgramCardProps) {
  return (
    <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6 shadow-soft">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-temple-snow/80">{description}</p>
      <ul className="mt-4 space-y-2 text-sm text-temple-snow/75">
        {highlights.map((point) => (
          <li key={point}>- {point}</li>
        ))}
      </ul>
      <Link
        to="/programs"
        className="focus-ring mt-6 inline-flex items-center gap-2 rounded text-sm font-semibold uppercase tracking-wide text-temple-gold hover:text-temple-snow"
      >
        See program details <ArrowRight size={16} />
      </Link>
    </article>
  )
}
