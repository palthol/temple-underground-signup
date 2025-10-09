# TODO Checklist

Foundation
- [ ] Choose monorepo layout: `packages/*`, `apps/*`, `services/*`
- [ ] Define shared TypeScript types for schema, content, registry
- [ ] Set up Vite + MUI + React Hook Form + Yup baseline

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
- [ ] SignaturePad wrapper (PNG + vector JSON)
- [ ] Stepper, Section, Fieldset, ErrorSummary

External Controller
- [ ] GUI for editing content keys with preview
- [ ] Live sync channel (shared store or postMessage)
- [ ] Versioning and publish/draft workflow

API & Persistence
- [ ] Supabase schema migrations for participants/waivers/audit
- [ ] `POST /api/waivers/submit` implementation
- [ ] PDF generation (pdf-lib), SHA‑256, upload, audit write
- [ ] Admin endpoints and auth guard

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

