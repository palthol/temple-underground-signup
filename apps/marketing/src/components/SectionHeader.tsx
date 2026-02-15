interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeaderProps) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left'

  return (
    <div className={`max-w-3xl ${alignment}`}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-temple-gold">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-temple-snow sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-temple-snow/80">{description}</p> : null}
    </div>
  )
}
