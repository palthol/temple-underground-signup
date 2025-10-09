# AGENTS.md — Working Agreements for This Repo

Purpose

- Build a modular, schema‑driven waiver app with first‑class i18n (EN/ES), accessibility, performance, auditability, and a minimal, well‑documented surface area.

Scope & Guardrails

- Do the minimum necessary to achieve the acceptance criteria for the current task.
- Touch only files in scope; do not refactor unrelated code.
- Favor composability and small patches; avoid one‑off hacks.

Change Boundaries

- Public contracts are stable unless approved: schema format, component SDK/registry, and API shapes.
- Any DB schema change must include a migration, docs update, and backfill/rollback notes.
- Changes affecting i18n, a11y, or PDF output must update the corresponding docs under `docs/`.

Code Style & Readability

- TypeScript strict mode; explicit types at module boundaries; avoid `any`.
- Small units: keep functions ~40 lines or less; extract helpers early.
- Clear names using domain terms; avoid abbreviations.
- Code should be self‑documenting; add comments only for non‑obvious decisions.
- Prefer pure, testable functions; limit side effects.

Architecture & Modularity

- Schema‑driven rendering only; never hardcode content/UI strings in components.
- Components integrate via the SDK contract + registry and ship with a manifest.
- Proprietary components live in separate packs and are lazy‑loaded.
- Keep domain logic in hooks/services, not inside UI components.

Performance, i18n, Accessibility

- Performance: initial bundle < 200KB gzip; step‑level code split; lazy‑load locales/packs.
- i18n: all UI text via content keys; support `en`/`es`; add keys before code.
- a11y: correct label association, focus management, `<html lang>`, localized ARIA.

Data, Security, Privacy

- Never log PII; redact at boundaries.
- Storage buckets are private; PDFs via signed URLs; audit is append‑only.
- Persist `locale` and `content_version` with submissions/audit.
- Use least privilege for Supabase keys; document env vars.

Testing

- Add focused unit tests for new logic; integration tests for flows you change.
- Snapshot tests for Spanish rendering and PDF hash when touched.
- Keep tests close to the code you modify; don’t create broad suites unprompted.

Git & Review

- Branch naming: `feat/...`, `fix/...`, `docs/...`, `chore/...`.
- Conventional Commits; small, reviewable diffs.
- PR description must include what/why, screenshots for UI, and before/after for perf when relevant.
- Update `docs/` and `docs/todo.md` in the same PR when behavior changes.

Task Brief Template (Use When Opening Work)

- Goal: one‑sentence outcome.
- Scope: files/modules allowed to change.
- Constraints: perf/i18n/a11y/security specifics.
- Acceptance Criteria: bullet list, testable.
- Non‑Goals: explicitly out of scope.
- Risks/Tradeoffs: known constraints or debt tolerated.

Definition of Done

- Meets acceptance criteria; passes typecheck/lint/tests.
- No hard‑coded strings; EN/ES keys present or TODO with rationale.
- a11y pass for added UI (labels, focus, aria, keyboard).
- Performance implications noted; lazy‑loaded when appropriate.
- Docs updated (architecture, schema, controller, testing, ops as relevant).

When To Ask vs Decide

- Ask: schema/SDK contract changes, DB schema, security posture, cross‑cutting UX.
- Decide (and document): component internals, hook structure, local refactors within a module.

Non‑Goals / Out of Scope

- Adding new dependencies beyond the stack without approval.
- Broad stylistic refactors; cross‑module renames.
- Features beyond the current plan/TODO.

Operational Constraints

- Keep environment variable usage minimal and documented.
- Use feature flags for risky changes; default off.
- Migrations are idempotent; include rollback notes.

