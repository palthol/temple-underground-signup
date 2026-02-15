interface CoachCardProps {
  name: string
  role: string
  bio: string
  specialties: string[]
}

export default function CoachCard({ name, role, bio, specialties }: CoachCardProps) {
  return (
    <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6">
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="mt-1 text-sm uppercase tracking-wide text-temple-gold">{role}</p>
      <p className="mt-4 text-sm leading-6 text-temple-snow/80">{bio}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {specialties.map((specialty) => (
          <li key={specialty} className="rounded-full border border-temple-gold/35 px-3 py-1 text-xs uppercase tracking-wide">
            {specialty}
          </li>
        ))}
      </ul>
    </article>
  )
}
