# API decision log

Entries are append-only. Supersede an earlier decision by referencing its ID.

| ID | Date | Decision | Status |
| --- | --- | --- | --- |
| API-ADR-001 | 2026-09-03 | This repository is the only backend and canonical schema owner. | accepted |
| API-ADR-002 | 2026-09-03 | Production database writes require explicit task authorization. | accepted |
| API-ADR-003 | 2026-09-03 | Capability status uses verified, implemented, unwired, and missing. | accepted |
| API-ADR-004 | 2026-09-03 | Privileged multi-write operations should use transactional RPCs and idempotency where retryable. | accepted |

## Open decisions

- Deployment and scheduling platform ownership.
- Staff authentication/RBAC design.
- Payment, email, and SMS providers.
- Long-term role of personal-finance entries versus formal billing.
