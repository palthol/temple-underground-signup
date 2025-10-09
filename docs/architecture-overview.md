# Architecture Overview

Goal: A modular, mobile-first waiver app with a schema-driven form engine, component registry, external content controller, Supabase backend, and PDF/audit trail.

High-Level Components
- Web App (React + Vite + MUI): QR → Multi-step form → Signature → Submit.
- Core Form Engine: Schema → Render via registry; RHF state; Yup validation.
- Component SDK: Contracts and registration for base and proprietary components.
- External Controller: GUI to edit text content keyed by IDs; live previews.
- API Service: Submit, PDF generation, audit, and admin search/detail.
- Supabase: Postgres tables, private Storage buckets, optional Auth for admin.

Data Flow
1. User completes form; client validates and posts submission.
2. API validates server-side; persists rows; stores signature image/vector.
3. API generates PDF, computes SHA-256, uploads to Storage; writes audit.
4. Admin logs in; searches records; views detail; downloads PDF via signed URL.

Modularity Strategy
- Schema-driven rendering decouples content and component implementation.
- Registry allows late-bound proprietary components, lazy-loaded per need.
- External controller edits content keys without redeploying the app.

Non-Negotiables
- Accessibility (WCAG 2.1 AA), mobile-first, private storage, audit invariants.

