# Testing Strategy

Scope

- Unit: schema validators, engine mapping, SDK contracts.
- Component: base inputs (a11y, controlled behavior, error states).
- Integration: form steps, conditional logic, autosave, submission flow.
- Server: validation, PDF generation (hash snapshots), storage writes.
- i18n: render snapshots for Spanish; ensure missing-key warnings.

Fixtures

- Minimal schemas for personal/emergency/signature steps.
- Content maps with missing keys to test fallbacks.
- Spanish content set with long strings to test overflow.

CI

- Lint, typecheck, test, build.
- Lighthouse CI on preview deploys (apps).
- i18n key-audit step to detect untranslated strings.

Tools

- Vitest/Jest, Testing Library, Playwright for e2e (optional).
