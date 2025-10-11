# TODO Checklist

Completed in Slice 1

- Monorepo + workspaces scaffolded (`apps/*`, `services/*`)
- Waiver app bootstrapped (Vite + React + MUI + RHF + Yup)
- EN/ES i18n provider, language switch, `<html lang>` updates
- SignaturePad wrapper with PNG + vector JSON
- Minimal form (Full Name, DOB, Email) and submit flow
- API `POST /api/waivers/submit` stub with PDF generation + SHA-256
- Supabase migrations created (participants, waivers, audit_trails with `locale`, `content_version`)
- Locales added: `src/locales/en.json`, `src/locales/es.json`

Foundation

- [x] Choose monorepo layout: `packages/*`, `apps/*`, `services/*`
- [ ] Define shared TypeScript types for schema, content, registry
- [x] Set up Vite + MUI + React Hook Form + Yup baseline

Schema & Content

- [ ] Draft form schema spec (steps, fields, rules, content keys)
- [ ] Define content model and i18n format
- [ ] Create schema validators and type guards

Component SDK

- [ ] Write component contract and manifest interface
- [ ] Implement `ComponentRegistry` with versioned registration
- [ ] Build dev harness for components (playground)

Core Engine

- [ ] Renderer: schema → React tree using registry
- [ ] RHF integration with controlled adapters
- [ ] Conditional visibility & async validation hooks
- [ ] Autosave and resume (localStorage)

Base Components (MUI)

- [ ] Text, TextArea, Select, RadioGroup, Checkbox, Date
- [x] SignaturePad wrapper (PNG + vector JSON)
- [ ] Stepper, Section, Fieldset, ErrorSummary

External Controller

- [ ] GUI for editing content keys with preview
- [ ] Live sync channel (shared store or postMessage)
- [ ] Versioning and publish/draft workflow
- [ ] Locale-aware authoring: EN/ES tabs, side-by-side view, missing-key highlighting
- [ ] Preview sync supports `locale:select` messages

API & Persistence

- [x] Supabase schema migrations for participants/waivers/audit
- [x] `POST /api/waivers/submit` implementation
- [ ] PDF generation (pdf-lib), SHA‑256, upload, audit write
- [ ] Admin endpoints and auth guard
 - [ ] Embed PDF fonts with full Latin support for Spanish diacritics

Admin App

- [ ] Login, Search (name/email/phone/date)
- [ ] Detail view with PDF preview, audit JSON

Theming & i18n

- [ ] Theme tokens and brand guide (MUI)
- [ ] Locale loader and key fallback strategy

Performance & Security

- [ ] Step-level chunking and lazy component loading
- [ ] Input render memoization and debounced autosave
- [ ] Private buckets, signed URLs, key scoping

Quality

- [ ] Unit/integration tests; schema fixtures
- [ ] PDF snapshot/hash tests
- [ ] CI pipeline (lint, typecheck, test, build)
- [ ] SDK semantic versioning and changelog

Localization (Spanish)

- [x] Add i18n provider and language switch
- [ ] Integrate MUI `esES` and date locale (dayjs/date-fns)
- [x] Create `content.es.json` and fill required keys; set fallbacks
- [ ] Persist `locale` and `content_version` in audit (and submissions if needed)
- [ ] Accent-insensitive search in admin (Postgres `unaccent` or collation)
- [x] Accept and propagate `locale` through API; localize error messages when appropriate
- [ ] Admin UI locale toggle and filters
- [ ] Add `<html lang>` and localized ARIA labels; integrate MUI `esES`
- [ ] i18n checks for missing keys and pseudo-locale overflow tests

Frontend Incremental Patches

- [x] Fix SignaturePad event/cleanup (remove `destroy`, use `onEnd`)
- [x] Disable submit until signature present
- [x] Add ErrorSummary and focus-first-error on submit
- [x] Replace alert with Success screen showing reference IDs
- [x] Apply MUI `esES` locale in theme (wired to language switch)
- [x] Lazy-load SignaturePad to reduce initial bundle
- [x] Add Vite dev proxy for API (`/api`, `/health`) to simplify local setup
