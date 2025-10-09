# Architecture Overview

Goal: A modular, mobile-first waiver app with a schema-driven form engine, component registry, external content controller, Supabase backend, PDF/audit trail, and first-class Spanish localization.

High-Level Components

- Web App (React + Vite + MUI): QR → Multi-step form → Signature → Submit.
- Core Form Engine: Schema → Render via registry; RHF state; Yup validation.
- Component SDK: Contracts and registration for base and proprietary components.
- External Controller: GUI to edit text content keyed by IDs; live previews; multi-locale authoring (EN/ES).
- API Service: Submit, PDF generation, audit, and admin search/detail.
- Supabase: Postgres tables, private Storage buckets, optional Auth for admin.
- i18n: Locale provider, content catalogs per locale, MUI `esES` and date locale integration.

Data Flow

1. User completes form; client validates and posts submission.
2. API validates server-side; persists rows; stores signature image/vector.
3. API generates PDF, computes SHA-256, uploads to Storage; writes audit.
4. Admin logs in; searches records; views detail; downloads PDF via signed URL.

Modularity Strategy

- Schema-driven rendering decouples content and component implementation.
- Registry allows late-bound proprietary components, lazy-loaded per need.
- External controller edits content keys without redeploying the app; supports Spanish catalogs with fallbacks.

Non-Negotiables

- Accessibility (WCAG 2.1 AA), i18n (Spanish), mobile-first, private storage, audit invariants.
