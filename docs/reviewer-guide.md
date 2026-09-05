# API reviewer guide

Review against the work-queue ID, its acceptance criteria, and this repository's
`AGENTS.md`.

## Blocking findings

- **P0:** leaked secrets or personal data; auth/RLS bypass; unsafe destructive migration;
  financial duplication/corruption; breakage of the live waiver path.
- **P1:** non-transactional new multi-write flow; schema change without migration and
  verification plan; missing validation for money/state/IDs; changed contract without
  focused tests and updated docs.
- **P2:** weak error handling/observability, stale operational docs, or unjustified
  privileged/direct database access.

## Required checks

- Admin and cron routes use their intended middleware.
- Money is integer cents and allocation limits use canonical net-due logic.
- RPC signatures, error keys, and response envelopes match `admin-api.md`.
- Exposed tables have RLS; policies express authorization, not authentication alone.
- `SECURITY DEFINER` is justified, access-restricted, and search-path safe.
- Migrations are forward-safe and do not assume production tables are empty.
- Retry and idempotency behavior is explicit.
- Relevant tests plus the full API suite and waiver guard pass.
- `current-state.md`, API contracts, and queue evidence are updated.

A passing unit test suite is not evidence that an unused production workflow works end to
end. State residual risk explicitly.
