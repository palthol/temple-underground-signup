# API task claim

- Task ID: API-TEST-001
- Owner: cloud-agent
- Claimed at: 2026-09-07T18:55:00Z
- Base branch: `develop`
- Base commit: `3a02838d42f8c0a79ef0d9b661f481bda902ce05`
- Production write authorized: no
- Status: `in_progress`

## Scope and allowed files

- `services/api/src/**/*.test.js`
- `services/api/src/**/*.test.ts`
- `services/api/vitest.config.ts` (only if required)
- Shared queue files: `work-queue/claims/API-TEST-001.md`, `work-queue/queue.json`, `work-queue/README.md`

## Verification evidence

Commands run, exit codes, and what you did **not** do (especially production writes).

## Handoff or blocker

`in_progress`. Isolated billing/receipt integration tests in progress.
