import { useState, type FormEvent, type ReactNode } from 'react'
import { siteConfig } from '../config/site'
import { leadSchema, submitLead, type LeadFormData } from '../lib/lead'
import { trackEvent } from '../lib/analytics'
import { useSeo } from '../lib/seo'
import type { LeadSubmitStrategy } from '../types/lead'

const initialState: LeadFormData = {
  name: '',
  email: '',
  phone: '',
  goals: 'first-class',
  preferredTime: '',
  notes: '',
}

export default function ContactPage() {
  useSeo({
    title: 'Contact | Temple Underground',
    description: 'Book a Temple Underground trial class and tell us your goals so we can place you in the right training path.',
    pathname: '/contact',
  })

  const [data, setData] = useState<LeadFormData>(initialState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<string>('')
  const [strategy, setStrategy] = useState<LeadSubmitStrategy>('endpoint')
  const [submitting, setSubmitting] = useState(false)

  const update = <K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('')
    const parsed = leadSchema.safeParse(data)

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? 'form'
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setSubmitting(true)
    trackEvent('lead_submit_attempt', { strategy })

    const response = await submitLead(parsed.data, strategy)
    setSubmitting(false)
    setStatus(response.message)
    if (response.success && strategy === 'endpoint') {
      setData(initialState)
    }
  }

  return (
    <section className="container-shell py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-2">
        <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6 sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight">Book a Trial Class</h1>
          <p className="mt-3 text-sm leading-7 text-temple-snow/80">
            Tell us your goals and preferred training window. We will place you in a class where coaching, pace, and progression fit your
            level.
          </p>

          <form className="mt-7 space-y-4" onSubmit={onSubmit} noValidate>
            <Field label="Full Name" error={errors.name}>
              <input
                className="focus-ring w-full rounded-md border border-temple-charcoal bg-temple-ink px-3 py-2 text-sm"
                value={data.name}
                onChange={(event) => update('name', event.target.value)}
                autoComplete="name"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  className="focus-ring w-full rounded-md border border-temple-charcoal bg-temple-ink px-3 py-2 text-sm"
                  value={data.email}
                  onChange={(event) => update('email', event.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input
                  type="tel"
                  className="focus-ring w-full rounded-md border border-temple-charcoal bg-temple-ink px-3 py-2 text-sm"
                  value={data.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  autoComplete="tel"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary Goal" error={errors.goals}>
                <select
                  className="focus-ring w-full rounded-md border border-temple-charcoal bg-temple-ink px-3 py-2 text-sm"
                  value={data.goals}
                  onChange={(event) => update('goals', event.target.value as LeadFormData['goals'])}
                >
                  <option value="first-class">First class / beginner start</option>
                  <option value="fitness-confidence">Fitness + confidence</option>
                  <option value="competition">Competition development</option>
                  <option value="weight-management">Weight management</option>
                  <option value="youth-inquiry">Youth training inquiry</option>
                </select>
              </Field>
              <Field label="Preferred Time" error={errors.preferredTime}>
                <input
                  className="focus-ring w-full rounded-md border border-temple-charcoal bg-temple-ink px-3 py-2 text-sm"
                  value={data.preferredTime}
                  onChange={(event) => update('preferredTime', event.target.value)}
                  placeholder="Morning / Afternoon / Evening"
                />
              </Field>
            </div>

            <Field label="Notes (optional)" error={errors.notes}>
              <textarea
                className="focus-ring w-full rounded-md border border-temple-charcoal bg-temple-ink px-3 py-2 text-sm"
                rows={4}
                value={data.notes ?? ''}
                onChange={(event) => update('notes', event.target.value)}
              />
            </Field>

            <Field label="Submit Strategy">
              <div className="flex flex-wrap gap-4 text-sm text-temple-snow/80">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="strategy"
                    value="endpoint"
                    checked={strategy === 'endpoint'}
                    onChange={() => setStrategy('endpoint')}
                  />
                  Ready-to-wire API endpoint
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="strategy"
                    value="mailto"
                    checked={strategy === 'mailto'}
                    onChange={() => setStrategy('mailto')}
                  />
                  Mailto fallback
                </label>
              </div>
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="focus-ring rounded-md bg-temple-red px-5 py-3 text-sm font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Book a Trial Class'}
            </button>
            {status ? <p className="text-sm text-temple-gold">{status}</p> : null}
          </form>
        </article>

        <aside className="space-y-6">
          <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6">
            <h2 className="text-xl font-semibold">Location</h2>
            <p className="mt-3 text-sm text-temple-snow/78">{siteConfig.business.addressLine1}</p>
            <p className="text-sm text-temple-snow/78">{siteConfig.business.cityStateZip}</p>
            <p className="mt-3 text-sm text-temple-snow/78">{siteConfig.business.phone}</p>
            <a
              href={siteConfig.business.mapUrl}
              className="focus-ring mt-4 inline-block rounded text-sm font-semibold uppercase tracking-wide text-temple-gold"
            >
              Open Map
            </a>
          </article>

          <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6">
            <h2 className="text-xl font-semibold">What to bring</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-temple-snow/80">
              <li>- Comfortable training clothes and water</li>
              <li>- Hand wraps for boxing classes (if you have them)</li>
              <li>- A notebook mindset: ready to learn and listen</li>
            </ul>
          </article>

          <article className="rounded-xl border border-temple-charcoal bg-temple-charcoal/35 p-6">
            <h2 className="text-xl font-semibold">Gym etiquette</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-temple-snow/80">
              <li>- Arrive on time and check in with your coach</li>
              <li>- Keep training areas clean and equipment organized</li>
              <li>- Respect partners and communicate intensity clearly</li>
            </ul>
          </article>
        </aside>
      </div>
    </section>
  )
}

interface FieldProps {
  label: string
  children: ReactNode
  error?: string
}

function Field({ label, children, error }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-temple-gold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-300">{error}</span> : null}
    </label>
  )
}
