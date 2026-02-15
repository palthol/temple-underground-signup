import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="container-shell py-24">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="mt-4 text-sm text-temple-snow/80">The page you are looking for does not exist.</p>
      <Link to="/" className="focus-ring mt-6 inline-block rounded-md bg-temple-red px-4 py-3 text-sm font-semibold uppercase tracking-wide">
        Return Home
      </Link>
    </section>
  )
}
