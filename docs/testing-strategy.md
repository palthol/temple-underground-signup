# Testing Strategy

Scope
- Unit: schema validators, engine mapping, SDK contracts.
- Component: base inputs (a11y, controlled behavior, error states).
- Integration: form steps, conditional logic, autosave, submission flow.
- Server: validation, PDF generation (hash snapshots), storage writes.

Fixtures
- Minimal schemas for personal/emergency/signature steps.
- Content maps with missing keys to test fallbacks.

CI
- Lint, typecheck, test, build.
- Lighthouse CI on preview deploys (apps).

Tools
- Vitest/Jest, Testing Library, Playwright for e2e (optional).

