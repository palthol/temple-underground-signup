# API work queue

`queue.json` is the machine-readable index. This document defines scope and acceptance
criteria. Production writes default to **not authorized**.

Doc map: `docs/README.md`. Historical checklists live in `docs/archive/`.

## Claim protocol

1. Confirm every dependency is `done`.
2. Atomically create `claims/<TASK-ID>.md` from `claims/TEMPLATE.md`; an existing file
   means another agent owns the task.
3. A coordinator alone updates shared queue status/owner fields.
4. Own only the declared paths; tasks with overlapping files run serially.
5. Record commands/results in the claim, without secrets or production personal data.

## Queue

| ID | Lane | Status | Depends on | Summary |
| --- | --- | --- | --- | --- |
| API-DOC-001 | docs | done | — | Establish and reconcile API documentation infrastructure |
| API-DEV-001 | tooling | ready | API-DOC-001 | Repair lockfile so clean `npm ci` succeeds |
| API-SEC-001 | security | blocked | API-DEV-001 | Triage dependency findings and safe upgrades |
| API-TEST-001 | tests | blocked | API-DEV-001 | Add billing/receipt route integration tests |
| API-TEST-002 | tests | blocked | API-DEV-001 | Add subscription/scheduling route integration tests |
| API-OPS-001 | deployment | ready | API-DOC-001 | Inventory API deployment, hostname, CORS, env names, and ownership |
| API-GATE-001 | validation | blocked | API-DEV-001, API-TEST-001, API-TEST-002, API-OPS-001 | Define safe non-production validation environment |
| API-VAL-001 | validation | blocked | API-GATE-001 | Smoke-test finance and receipt workflows |
| API-VAL-002 | validation | blocked | API-GATE-001 | Smoke-test subscriptions, scheduling, and entitlements |
| API-HARD-001 | backend | blocked | API-TEST-001, API-VAL-001 | Make record-payment atomic/idempotent |
| API-HARD-002 | backend | blocked | API-GATE-001 | Add waiver-submission idempotency/recovery |
| API-SCHED-001 | backend | blocked | API-TEST-002, API-VAL-002 | Add template CRUD and recurring session generation |
| API-AUTO-001 | automation | blocked | API-OPS-001, API-VAL-001 | Add supported monthly-charge cron endpoint |
| API-AUTO-002 | automation | blocked | API-OPS-001, API-VAL-001 | Deploy controlled Discord schedules |
| API-AUTH-001 | security | blocked | API-OPS-001 | Design and implement staff RBAC |
| API-PAY-001 | integrations | blocked | API-HARD-001, API-AUTH-001 | Design payment-provider integration |

Safe initial parallel batch: `API-DEV-001` and `API-OPS-001`; their allowed files must not
overlap.

## Acceptance summaries

- **API-DEV-001:** clean `npm ci`, API tests, and waiver guard pass; avoid unrelated
  upgrades.
- **API-OPS-001:** document real host/platform/health check and non-secret env names;
  verify CORS; commit no secrets.
- **API-TEST-001/002:** cover authorization, validation, success, and partial failure with
  isolated fixtures.
- **API-GATE-001:** define local or approved development-branch fixtures and cleanup;
  production test writes remain prohibited.
