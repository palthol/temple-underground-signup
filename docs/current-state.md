# API current state

**Verified:** 2026-09-05 (deploy inventory); production snapshot 2026-09-03  
**Repository:** `palthol/TU-api`  
**Production database:** Supabase `jhxzecxkccqlgyazhsnb`  
**Deployed API:** Render — `https://api.templeunderground.com` (see [deployment.md](./deployment.md))

This is the API repository's status source of truth. Use `admin-api.md` for request and
response contracts and `api-schema-audit.md` for detailed schema evidence.

## Status

| Domain | Status | Evidence | Qualification |
| --- | --- | --- | --- |
| Deployment / health | verified | Live `/health` and `/health/deep` on public host | Render dashboard service ID not readable via MCP |
| Waiver submission | verified | 32 participants and 36 waivers in production | Only workflow proven by production usage |
| Schema | verified | Project healthy; expected 21 migrations present | Latest live version is timestamped while repo file is `0021` |
| Public/admin routes | implemented | Routes mounted; API suite passes 18/18 | Most business routes lack integration tests |
| Reporting | implemented | All 19 referenced views exist | Most operational source tables are empty |
| Billing/receipts | implemented, unproven | Schema and routes exist | 0 charges, payments, receipts in production |
| Subscriptions | implemented, unproven | `create_subscription` RPC and route exist | 0 subscriptions in production |
| Scheduling | implemented, unproven | Session and attendance routes exist | 0 sessions and attendance rows |
| Notifications | manually callable | Discord routes exist | No scheduler found in repository |
| On-demand waiver PDF | implemented, unwired | Renderer/route tests pass | Active admin UI uses stored signed PDF URLs |

## Production snapshot

Read-only inspection returned: participants 32; waivers 36; subscriptions, sessions,
attendance, charges, payments, receipts, personal-finance entries, operating expenses, and
marketing leads all 0. RLS is enabled on all public tables.

No production writes were performed. Deployed Express host is **Render** at
`https://api.templeunderground.com` (also
`https://temple-underground-signup.onrender.com`). Read-only health checks on
2026-09-05: `GET /health` → `{ok:true}`; `GET /health/deep` → `{ok:true,db:true}`.
Live CORS responds with `Access-Control-Allow-Origin: *`. Env **names** only are listed
in [deployment.md](./deployment.md) and `services/api/.env.example`.

## Known gaps and risks

- `record-payment` is a multi-step, non-transactional write.
- Waiver submission spans storage and database operations without end-to-end idempotency.
- `npm ci` fails because the lockfile omits platform packages required by the declared
  Supabase CLI version.
- Dependency audit reported 3 moderate findings on 2026-09-03.
- No route-level suites cover the main billing, subscription, scheduling, or reporting
  workflows.
- Monthly-charge generation and Discord notifications have no configured scheduler here.
- Schedule-template CRUD and recurring-session generation do not exist.
- Staff authorization is a shared `x-admin-key`, not individual RBAC.
- CORS defaults to `*` when `ALLOWED_ORIGIN` is absent; production currently reflects `*`.

## Verification baseline

- `npm --workspace services/api test`: 18/18 passing.
- `npm run guard:waiver-schema`: passing.
- Documentation reconciled against the mounted route list, migrations `0001`–`0021`, and test files (2026-09-03).
- Deploy inventory (API-OPS-001): public host + health documented in [deployment.md](./deployment.md) (2026-09-05).
