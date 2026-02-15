import { siteConfig } from '../config/site'

export default function ScheduleTable() {
  return (
    <section className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6">
      <h3 className="text-xl font-semibold">Weekly Training Schedule</h3>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <article>
          <p className="text-sm font-semibold uppercase tracking-wide text-temple-gold">Monday - Friday</p>
          <ul className="mt-3 space-y-2">
            {siteConfig.schedule.weekdays.map((block) => (
              <li key={block.label} className="flex items-center justify-between gap-4 border-b border-temple-charcoal py-2">
                <span className="text-sm text-temple-snow/85">{block.label}</span>
                <span className="text-sm font-medium">{block.time}</span>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <p className="text-sm font-semibold uppercase tracking-wide text-temple-gold">Sunday</p>
          <ul className="mt-3 space-y-2">
            {siteConfig.schedule.sunday.map((block) => (
              <li key={block.label} className="flex items-center justify-between gap-4 border-b border-temple-charcoal py-2">
                <span className="text-sm text-temple-snow/85">{block.label}</span>
                <span className="text-sm font-medium">{block.time}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
      <p className="mt-5 rounded-lg border border-temple-gold/20 bg-temple-gold/10 p-4 text-sm leading-6 text-temple-snow/85">
        {siteConfig.schedule.trainingWindowNote}
      </p>
    </section>
  )
}
