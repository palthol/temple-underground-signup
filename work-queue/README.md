# API work queue

`queue.json` is the machine-readable index. `tasks/<ID>.md` is the brief an agent
must follow. Production writes default to **not authorized**.

Doc map: `docs/README.md`. Historical checklists live in `docs/archive/`.

## Agent start (do this in order)

1. Read `docs/current-state.md` and this file.
2. In `queue.json`, pick a task with `"status": "ready"` whose `depends_on` IDs are
   all `"done"`. Prefer the parallel batch below when starting a new session.
3. Open `work-queue/tasks/<ID>.md`. If you cannot satisfy its constraints, stop.
4. Copy `claims/TEMPLATE.md` to `claims/<ID>.md`. **If that path already exists,
   do not take the task.**
5. Branch from `develop`: `agent/<ID>-short-slug`.
6. Implement only the brief. Record commands in the claim. Commit on the branch.
7. On success: set the task `"status": "done"` in `queue.json` and this table,
   fill the claim evidence, update `docs/current-state.md` only if the brief says
   to. Do not flip a successor to `ready` unless every dependency is `done`.

## Shared files (every task may touch)

- `work-queue/claims/<ID>.md`
- `work-queue/queue.json` (your row only)
- `work-queue/README.md` (your row only)
- `docs/current-state.md` (only when the brief requires evidence)

Do not rewrite other tasks' rows. Parallel agents: `API-DEV-001` and
`API-OPS-001` must not share exclusive paths.

## Queue

| ID | Lane | Status | Depends on | Brief |
| --- | --- | --- | --- | --- |
| [API-DOC-001](tasks/API-DOC-001.md) | docs | done | — | Establish and reconcile API documentation infrastructure |
| [API-DEV-001](tasks/API-DEV-001.md) | tooling | done | API-DOC-001 | Repair lockfile so clean `npm ci` succeeds |
| [API-SEC-001](tasks/API-SEC-001.md) | security | ready | API-DEV-001 | Triage dependency findings and safe upgrades |
| [API-TEST-001](tasks/API-TEST-001.md) | tests | ready | API-DEV-001 | Add billing/receipt route integration tests |
| [API-TEST-002](tasks/API-TEST-002.md) | tests | ready | API-DEV-001 | Add subscription/scheduling route integration tests |
| [API-OPS-001](tasks/API-OPS-001.md) | deployment | ready | API-DOC-001 | Inventory API deployment, hostname, CORS, env names, and ownership |
| [API-GATE-001](tasks/API-GATE-001.md) | validation | blocked | API-DEV-001, API-TEST-001, API-TEST-002, API-OPS-001 | Define safe non-production validation environment |
| [API-VAL-001](tasks/API-VAL-001.md) | validation | blocked | API-GATE-001 | Smoke-test finance and receipt workflows |
| [API-VAL-002](tasks/API-VAL-002.md) | validation | blocked | API-GATE-001 | Smoke-test subscriptions, scheduling, and entitlements |
| [API-HARD-001](tasks/API-HARD-001.md) | backend | blocked | API-TEST-001, API-VAL-001 | Make record-payment atomic/idempotent |
| [API-HARD-002](tasks/API-HARD-002.md) | backend | blocked | API-GATE-001 | Add waiver-submission idempotency/recovery |
| [API-SCHED-001](tasks/API-SCHED-001.md) | backend | blocked | API-TEST-002, API-VAL-002 | Add template CRUD and recurring session generation |
| [API-AUTO-001](tasks/API-AUTO-001.md) | automation | blocked | API-OPS-001, API-VAL-001 | Add supported monthly-charge cron endpoint |
| [API-AUTO-002](tasks/API-AUTO-002.md) | automation | blocked | API-OPS-001, API-VAL-001 | Deploy controlled Discord schedules |
| [API-AUTH-001](tasks/API-AUTH-001.md) | security | blocked | API-OPS-001 | Design and implement staff RBAC |
| [API-PAY-001](tasks/API-PAY-001.md) | integrations | blocked | API-HARD-001, API-AUTH-001 | Design payment-provider integration |

Safe initial parallel batch: **API-DEV-001** and **API-OPS-001**.
