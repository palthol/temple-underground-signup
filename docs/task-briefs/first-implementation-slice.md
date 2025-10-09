# Task Brief — First Implementation Slice (Vertical)

## Goal

Deliver a minimal vertical slice of the public waiver flow: render one schema‑driven step (Personal + Signature), support EN/ES localization, validate inputs, capture signature (PNG + vector), submit to an API that persists participant + waiver + audit (with locale) in Supabase, and generate a basic signed PDF stored in a private bucket.

## Scope

- Implement monorepo skeleton minimally required for one app (`apps/waiver`) and server (`services/api`) or Vite server functions.
- Core form engine (rudimentary): schema → render via registry; RHF + Yup; conditional logic not needed yet.
- Base components for this slice: `Text`, `Date`, `SignaturePad`, `Stepper` (single step display), `ErrorSummary`.
- i18n provider with EN/ES catalogs for fields used in this slice.
- API endpoint `POST /api/waivers/submit` (server) with Supabase persistence and simple PDF generation.
- Supabase migrations for participants, waivers, audit_trails (with `locale`, `content_version`).

## Constraints

- Performance: initial bundle < 200KB gzip; lazy‑load signature pad component.
- i18n: UI strings via content keys; `en`/`es` switch; `<html lang>` set.
- Accessibility: label association, keyboard nav, focus management, error announce.
- Security/Privacy: private Storage buckets; signed URLs for PDFs; do not log PII.

## Acceptance Criteria

- Public route `/waiver` renders one step with fields: Full Name, Date of Birth, Email, and a Signature canvas.
- Language switch between EN/ES updates labels, helper text, and validation messages; `<html lang>` reflects locale.
- Validation blocks submit until all required fields and signature are present; error summary focuses first error.
- On submit, server persists participant, waiver (signature PNG URL, vector JSON), and audit row with `locale` and `content_version`.
- Server generates a basic PDF containing header, submitted fields, embedded signature image, signer name, and UTC timestamp; computes SHA‑256, uploads to private bucket, stores URL + hash in audit.
- API responds `{ ok: true, waiverId, participantId }`; client shows success state with reference ID.
- Migrations applied; Storage buckets verified private.

## Non‑Goals

- Multi‑step flow beyond the first step.
- Health assessment and consent initials.
- Admin panel and search.
- External controller GUI; manual content JSON is acceptable for this slice.

## Risks / Tradeoffs

- PDF font embedding for Spanish diacritics: use a Latin‑complete font (e.g., Roboto) now; revisit branding later.
- Signature capture on iOS Safari: verify pointer events; fall back to touch listeners if needed.
- Supabase service role in dev: restrict to server only; never expose in client.

## Testing

- Unit: engine schema→component mapping for the included fields; SDK prop contract for `SignaturePad` wrapper.
- Integration: form render, EN/ES toggle snapshot, validation and submit happy path.
- Server: PDF generation (hash present), audit row contains `locale` and `content_version`.

## Docs

- Update `docs/schema-reference.md` with the slice schema example.
- Update `docs/pdf-audit-spec.md` if output fields change.
- Update `docs/data-model-migrations.md` if migrations differ.
- Keep `docs/todo.md` in sync; check off items delivered.

## Rollout

- Feature flag `waiver.slice1` (default on in dev only).
- Migrations: run before starting server; verify `unaccent` optional.
- Env: set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPPORTED_LOCALES=en,es`, `DEFAULT_LOCALE=en`.

## Proposed Work Breakdown

1) Skeleton & i18n
- Scaffold `apps/waiver` and minimal `services/api` (or Vite server functions).
- Add i18n provider with EN/ES catalogs for the fields in scope; language switcher and `<html lang>`.

2) Engine & Components
- Implement minimal registry and renderer for field list.
- Build `Text`, `Date`, `SignaturePad` wrappers using MUI and signature_pad; RHF integration.
- Add validation with Yup; error summary component.

3) API & Supabase
- Write migrations for `participants`, `waivers`, `audit_trails` (with `locale`, `content_version`).
- Implement `POST /api/waivers/submit`: validate, persist, upload signature PNG, create audit row.

4) PDF & Audit
- Generate basic PDF (pdf-lib), compute SHA‑256, upload to private bucket.
- Store `document_pdf_url`, `document_sha256` in audit; include `locale`, `content_version`.

5) QA & Polish
- Test EN/ES flows; verify a11y and mobile.
- Update docs and TODO; prepare PR with screenshots and notes.

