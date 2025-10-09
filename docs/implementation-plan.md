# Implementation Plan

- Architecture
  - Modular engine with schema-driven rendering and a component registry.
  - Separation of concerns: core engine, component SDK, component packs, external controller, API.
  - Monorepo structure for shared types and tooling.

- Schema & Data
  - Form schema defines steps, layout, fields, validation, visibility rules, content keys.
  - Answers/PII separate from content text for i18n and theming.

- Component SDK
  - Props contract: value, onChange, onBlur, disabled, errors, meta, content slots.
  - Registration: `registry.register(id, Component, manifest)`.
  - Manifest: name, version, props schema, value schema, accessibility hints.

- Core Engine
  - Renderer maps schema → components via registry.
  - React Hook Form for state; Yup for validation; conditional logic; stepper and autosave.

- Base Components (MUI)
  - Text, TextArea, Select, RadioGroup, Checkbox, Date, SignaturePad, Stepper, Section, ErrorSummary.

- External Controller GUI
  - WYSIWYG editor for content keys; preview updates form live.
  - Versioning and publish workflow for content sets by tenant/brand/locale.

- Content Store & Sync
  - JSON store `{ key: { default, locale } }`; live sync via shared store or iframe postMessage.

- API & Data Layer
  - Submit endpoint validates, persists to Supabase, generates PDF, computes SHA-256, writes audit row.
  - Admin endpoints for search/detail with signed URLs to private buckets.

- Performance & UX
  - Step-level code splitting; lazy-load proprietary components.
  - Memoization; debounced autosave; mobile-first and accessible.

- Security & Compliance
  - Private storage buckets; least-privilege keys; audit invariants; retention.

- Testing & Tooling
  - Unit tests for engine/SDK; integration tests for flows; PDF hash checks.

- Release & Versioning
  - Semantic versioning for SDK/components; migration guides for schema changes.

