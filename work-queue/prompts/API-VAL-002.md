# Launch prompt — API-VAL-002

Copy everything below the line into a **new** Cursor Cloud Agent.

---

Do **only** work-queue task **API-VAL-002** (smoke-test subscriptions, scheduling, and entitlements). Do not implement API-HARD-002, API-SCHED-001, or any other task.

## Start (in this order)

1. Refresh `develop` before trusting the queue (snapshot trees can lag):

```bash
git fetch origin develop
git checkout develop
git pull origin develop
git rev-parse HEAD origin/develop
diff -u work-queue/queue.json <(git show HEAD:work-queue/queue.json)
```

`HEAD` must match `origin/develop`. If they differ, stop and refresh.

2. Read `work-queue/README.md`, `work-queue/tasks/API-VAL-002.md`, `docs/current-state.md`, `docs/validation-environment.md`, and `docs/admin-api.md` (scheduling + `POST /api/admin/billing/subscriptions` + Discord notification routes).
3. If `work-queue/claims/API-VAL-002.md` already exists, **stop** and report that the task is claimed. Do not take it.
4. Copy `work-queue/claims/TEMPLATE.md` to `work-queue/claims/API-VAL-002.md` and fill it in.
5. Branch from `develop`. The brief suggests `agent/API-VAL-002-scheduling-smoke`. If this run requires `cursor/<slug>-<suffix>`, use that required Cloud naming and note the conflict in the claim (same as API-VAL-001).

## Hard constraints

- **Production writes: no.** Never point `SUPABASE_URL`, `TU_TEST_API_BASE`, or `services/api/.env` at project `jhxzecxkccqlgyazhsnb`, `https://api.templeunderground.com`, or `https://temple-underground-signup.onrender.com`.
- Stay in allowed paths:
  - `docs/current-state.md`
  - `docs/api-schema-audit.md` (checklist only)
  - `work-queue/claims/API-VAL-002.md`
  - `work-queue/queue.json` (API-VAL-002 row only)
  - `work-queue/README.md` (API-VAL-002 row only)
  - Test/script files **only** if a fixture bug must be fixed to complete the smoke
- Do not rewrite other tasks' queue/README rows. Do not flip API-SCHED-001 to `ready` unless every dependency is `done` **and** you were asked to; default is leave successors blocked.
- Money is integer cents. Admin routes need `x-admin-key` equal to the **local** `ADMIN_API_KEY`.

## What to smoke (non-prod only)

Use the API-GATE-001 environment: local Supabase + local API. Follow `docs/validation-environment.md` bring-up, preflight, seed, and cleanup.

If Docker is missing on the Cloud VM, install/start it the same way API-VAL-001 did (local `docker.io` + `dockerd`; never a production database). Capture start logs under `/opt/cursor/artifacts/` without committing secrets.

```bash
npm install
npm run supabase:start          # keys: npx supabase status -o env
# Point services/api/.env and repo-root .env.validation at 127.0.0.1:54321 only
npm run dev:api
npm run tu-test:seed -- --count=2 --billing --schedule
```

`--billing` needs catalog plan **Basic Group Plan** (`supabase/seed.sql`). `--schedule` writes TU-TEST-marked sessions.

Exercise against `http://127.0.0.1:3001` with header `x-admin-key: <local ADMIN_API_KEY>`:

### Scheduling (happy + one failure each)

- `POST /api/admin/scheduling/sessions` — create a session (`starts_at` / `ends_at` ISO-8601). Failure: invalid dates or missing fields.
- `GET /api/admin/scheduling/sessions` and `GET /api/admin/scheduling/sessions/:sessionId`.
- `PATCH /api/admin/scheduling/sessions/:sessionId` — reschedule or `"cancel": true`. Failure: unknown session or cancelled-session attendance (`session_cancelled`).

### Attendance + entitlement (block vs warn — document which)

- `POST /api/admin/scheduling/sessions/:sessionId/attendance` with `enforce_entitlement: true` (default).
  - Happy: `present` for a participant who `can_attend_group_session` allows; row upserted.
  - Entitlement: a `present` that the RPC blocks must appear in `blocked` and **not** be upserted. If every row is blocked, expect `400` `all_records_blocked`.
  - Contrast: same payload with `enforce_entitlement: false` (warn/skip-check path) — document that it upserts without calling the RPC.
- Do not invent a new entitlement policy. Record whether the live API **blocks** (default) or only warns.

### Subscriptions (happy + one failure)

- `POST /api/admin/billing/subscriptions` for a TU-TEST participant + **Basic Group Plan** (`create_subscription` RPC). Optional `create_initial_charge` only if the plan is monthly.
- Failure: missing participant/plan, inactive plan, or `create_initial_charge` on a non-monthly plan — use a real `400` `error` key from the API, not a guessed one.

### Discord cron auth (only if non-prod webhook is configured)

- If `DISCORD_WEBHOOK_URL` is **not** set on the local API, do **not** configure a production webhook. Record `discord_webhook_not_configured` (or skip with that reason).
- If a **non-prod** webhook **and** `CRON_SECRET` are set locally: `POST /api/admin/notifications/discord/payment-reminders` and/or `daily-digest` with `x-cron-secret`. Also prove `x-admin-key` still works, and a wrong cron secret does not.
- Never post to a production Discord channel.

## Record results

- Save command logs under `/opt/cursor/artifacts/` (no secrets, no production URLs).
- Update `docs/current-state.md` **Subscriptions** and **Scheduling** rows (and entitlement note) the same way API-VAL-001 updated Billing/receipts. Do not overwrite the VAL-001 finance evidence.
- Fill the claim: commands, exit codes, happy + failure evidence, entitlement block-vs-warn, what you did **not** do (especially production writes).
- On success: set API-VAL-002 `"status": "done"` in `queue.json` and the README table only.

## Verify

- Preflight: env does not contain `jhxzecxkccqlgyazhsnb` or `api.templeunderground.com`.
- Cleanup: `npm run tu-test:cleanup` (dry-run first), then `--execute` on the local DB only.
- `npm --workspace services/api run test` still passes (VAL-002 is evidence, not a product change).

## Done when

- Claim has scheduling + subscription happy path and one failure each.
- Entitlement behavior on attendance is documented (block vs warn).
- Residual risk stated (scheduling still has no template CRUD / recurring generation — that is API-SCHED-001).
- No production writes.
