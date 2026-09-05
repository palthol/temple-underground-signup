# API-PAY-001 — Payment-provider integration

- Status: **blocked** until API-HARD-001 and API-AUTH-001 are done
- Lane: integrations
- Depends on: API-HARD-001, API-AUTH-001
- Production writes: no
- Branch from: `develop` as `agent/API-PAY-001-payments`

## Agent prompt

Design webhook → atomic payment/allocation/receipt mapping. Do not implement a
provider until the design (provider choice, idempotency, signature verify) is in
`docs/decision-log.md`. No service-role key in browsers.

## Allowed paths

- `docs/decision-log.md`, `docs/finance-subsystem-design.md`, `docs/admin-api.md`
- Later implementation: webhook route + tests + migrations
- Shared queue files

## Acceptance

- Design answers: provider, idempotency key, mapping to `record_payment` RPC
- Duplicate webhook does not double-allocate
- Secrets stay in platform env, not git
