interface TestimonialCardProps {
  quote: string
  name: string
  context: string
}

export default function TestimonialCard({ quote, name, context }: TestimonialCardProps) {
  return (
    <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/40 p-6">
      <p className="text-sm leading-6 text-temple-snow/85">"{quote}"</p>
      <p className="mt-4 text-sm font-semibold text-temple-snow">{name}</p>
      <p className="text-xs uppercase tracking-wide text-temple-gold/90">{context}</p>
    </article>
  )
}
