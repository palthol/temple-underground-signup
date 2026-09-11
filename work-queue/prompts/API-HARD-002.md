# Launch prompt — API-HARD-002

Copy everything below the line into a **new** Cursor Cloud Agent.

---

Do **only** work-queue task **API-HARD-002** (waiver-submission idempotency/recovery). Do not implement API-VAL-002, API-HARD-001, or any other task.

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

2. Read `work-queue/README.md`, `work-queue/tasks/API-HARD-002.md`, `docs/reviewer-guide.md`, `docs/admin-api.md` (`POST /api/waivers/submit`), `docs/frontend-backend-payload.md`, `docs/validation-environment.md`, `docs/api-schema-audit.md` §3 (waiver atomicity), and the handler in `services/api/src/index.js`. Also read `services/api/src/services/accounts/createOrBindParticipantAccount.js` and `services/api/src/services/notifications/notifyWaiverSubmitted.js`.
3. If `work-queue/claims/API-HARD-002.md` already exists, **stop** and report that the task is claimed. Do not take it.
4. Copy `work-queue/claims/TEMPLATE.md` to `work-queue/claims/API-HARD-002.md` and fill it in.
5. Branch from `develop`. The brief suggests `agent/API-HARD-002-waiver-idempotency`. If this run requires `cursor/<slug>-<suffix>`, use that required Cloud naming and note the conflict in the claim (same as API-VAL-001).

## Hard constraints

- **Production writes: no.** Do not `supabase db push` to project `jhxzecxkccqlgyazhsnb`. Do not POST waivers to `https://api.templeunderground.com`. If you add a migration, keep it forward-safe and **unapplied** to production.
- Do not break the live waiver contract. Existing success envelope fields must remain:
  `{ ok: true, waiverId, participantId, accountId, accountMemberId, sha256 }`.
- Failure envelope stays non-2xx `{ ok: false, ... }` (`errors` / `error` as today). Do not rename fields TU-Signup already sends or reads.
- Notification failure **must not** fail a persisted submit (already true via fire-and-forget `notifyWaiverSubmitted`; keep that).
- Stay in allowed paths:
  - `services/api/src/index.js` (submit handler only as needed)
  - `services/api/src/services/accounts/`
  - tests
  - `docs/admin-api.md`, `docs/frontend-backend-payload.md`, `docs/current-state.md`
  - `supabase/migrations/` only if a unique constraint or idempotency table is required (next number after `0021`; idempotent SQL)
  - `work-queue/claims/API-HARD-002.md`
  - `work-queue/queue.json` (API-HARD-002 row only)
  - `work-queue/README.md` (API-HARD-002 row only)
- Do not rewrite other tasks' queue/README rows. Do not start API-VAL-002.

## Problem to fix

`POST /api/waivers/submit` is sequential and not retry-safe:

1. Find-or-insert participant (email + DOB + phone match).
2. `createOrBindParticipantAccount` (membership reuse is OK; a retry **after** a 500 can still create extra waivers).
3. New `waiverId = randomUUID()` every call.
4. Storage uploads (signature + PDF) — errors are logged, not fatal.
5. Insert `waivers` + emergency/medical/audit + `event_ledger`.
6. Notify Discord/Slack asynchronously.

A client retry after a 500 (or a double-click) can create **duplicate waivers** (and related rows) for the same intent. Participant match reduces duplicate people when email+DOB+phone match, but waivers are not keyed.

## Required behavior

- Duplicate submit for the **same intent** must not create duplicate waivers or extra accounts.
- Define "same intent" explicitly in `docs/admin-api.md` (recommended: client `idempotency_key`, or a deterministic key from participant identity + `content_version` + signature hash — pick one and document it). Prefer an optional idempotency key that replays the original success envelope, mirroring `record_payment_refund`.
- First submit still creates participant / account bind / waiver / audit as today.
- Retry returns the **same** `waiverId` / `participantId` / `accountId` / `accountMemberId` (and a stable `sha256` if the PDF is unchanged).
- Storage + DB remaining non-atomic is OK only if retries cannot double-insert waivers; state residual risk if orphans can still exist.
- Tests required (Vitest): first submit success; immediate duplicate submit; notification throw does not change HTTP 200; validation failures unchanged.
- Optional live check on **local** GATE env only (`docs/validation-environment.md`): duplicate `POST /api/waivers/submit` against `http://127.0.0.1:3001`, never production. Use TU-TEST emails (`@tu-test.invalid`). Cleanup with `tu-test:cleanup`.

## Review bar (`docs/reviewer-guide.md`)

- P0: do not break the live waiver path; no secret leaks; no unsafe destructive migration.
- P1: new multi-write must be transactional or explicitly retry-safe; contract changes need tests + docs.
- Retry/idempotency behavior must be explicit in `docs/admin-api.md` and `docs/frontend-backend-payload.md`.
- If you add a `SECURITY DEFINER` RPC: justify it, restrict execute to service_role, safe `search_path`.

## Record results

- Fill the claim with commands, exit codes, and what you did **not** do (no production writes, no production migration apply).
- Update `docs/current-state.md` waiver/idempotency gap only — do not overwrite API-VAL-001 finance evidence.
- On success: set API-HARD-002 `"status": "done"` in `queue.json` and the README table only.

## Verify

```bash
npm --workspace services/api run test
npm run guard:waiver-schema
```

Plus the new idempotency tests. If you run a local duplicate-submit smoke, capture logs under `/opt/cursor/artifacts/` with no secrets.

## Done when

- Duplicate submit does not create duplicate waivers/accounts for the same intent.
- Existing success envelope fields remain.
- Notification failure still does not fail a persisted submit.
- API suite + new tests + waiver guard pass.
- Docs updated. Residual risk stated.
