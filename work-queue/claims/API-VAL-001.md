# API task claim

- Task ID: API-VAL-001
- Owner: Cursor Cloud Agent
- Claimed at: 2026-09-11
- Base branch: `develop`
- Base commit: (fill after first commit)
- Production write authorized: no
- Status: `in_progress`

Note: the work-queue brief suggests branching as `agent/API-VAL-001-finance-smoke`, but this run uses the required Cursor Cloud branch naming scheme.

## Scope and allowed files

- `docs/current-state.md`
- `docs/api-schema-audit.md` checklist
- `work-queue/claims/API-VAL-001.md`
- `work-queue/queue.json` (API-VAL-001 row only)
- `work-queue/README.md` (API-VAL-001 row only)
- Test/script files only if a fixture bug must be fixed to complete the smoke

## Verification evidence

Planned:

- `npm install`
- `npm run supabase:start`
- `npx supabase status -o env`
- `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ADMIN_API_KEY=... PORT=3001 npm run dev:api`
- `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... TU_TEST_API_BASE=http://127.0.0.1:3001 ADMIN_API_KEY=... npm run tu-test:seed -- --count=2 --billing`
- `curl` admin billing endpoints (happy path + one failure path each)
- `npm run tu-test:cleanup -- --execute`

## Handoff or blocker

In progress.

