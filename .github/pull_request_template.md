## Summary

Describe the change in 1–2 sentences.

## Motivation

Why is this change needed? Link issues or task briefs.

## Scope

- Modules/files touched:
- Public contracts changed? (schema/SDK/API): yes/no

## Changes

- Key implementation notes and tradeoffs
- Migrations? If yes, include file and rollback plan

## UI

- N/A for API-only changes. If a sibling front-end must change, link that PR.

## Performance

- Impact on API latency, query cost, or migration safety

## i18n / Accessibility

- N/A unless this change affects waiver PDF copy or a sibling UI contract.

## Security & Privacy

- Any PII handling, new storage, or permission changes?

## Testing

- Unit/integration/e2e updates
- PDF hash snapshots (if applicable)

## Docs

- Updated `docs/` (and `work-queue/` if the task is queued) accordingly

## Checklist

- [ ] Small, reviewable commits
- [ ] Tests pass (`npm --workspace services/api run test`, waiver guard if schema-touched)
- [ ] No secrets committed
- [ ] Acceptance criteria met

