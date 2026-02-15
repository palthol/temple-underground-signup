# Temple Underground Marketing Site

Modern marketing website for Temple Underground built with Vite, React, TypeScript, Tailwind CSS, React Router, Zod validation, Framer Motion, and Lucide icons.

## Run locally

From repository root:

```bash
npm install
npm run dev:marketing
```

Or from this app directory:

```bash
npm install
npm run dev
```

## Build + preview

```bash
npm run build
npm run preview
```

## Where to edit business info

All editable gym data lives in:

- `src/config/site.ts`

This includes:

- Name, phone, email, address, map link
- Social links
- Schedule blocks and training window note
- Pricing tiers and private add-ons
- CTA labels and links
- Default SEO values

## Form submission wiring

Form is on `src/pages/ContactPage.tsx` and uses Zod schema in:

- `src/lib/lead.ts`

Two strategies are implemented:

1. `endpoint` -> sends `POST /api/lead` with typed payload (`LeadPayload`)
2. `mailto` -> opens email client as fallback

To wire backend later:

1. Build your API endpoint (for example `/api/lead`)
2. Keep response shape aligned with `LeadResponse`
3. Update TODO in `submitLead()` for production error handling and auth if needed

## Analytics placeholder

`src/lib/analytics.ts` includes a simple `trackEvent()` helper with TODO notes for wiring `window.gtag`.

## SEO notes

- Base tags are in `index.html`
- Page-level title/description/OG updates run via `useSeo()` in `src/lib/seo.tsx`
- JSON-LD LocalBusiness schema is injected via `LocalBusinessSchema`
- Add a generated sitemap before production deploy (example `public/sitemap.xml` or build-time generation script)

## Deployment

This app is static and can be deployed to Netlify, Vercel, or Render static hosting.

### Netlify

- Build command: `npm --workspace apps/marketing run build`
- Publish directory: `apps/marketing/dist`

### Vercel

- Framework preset: Vite
- Root directory: `apps/marketing`

### Render (Static Site)

- Build command: `npm --workspace apps/marketing run build`
- Publish directory: `apps/marketing/dist`
