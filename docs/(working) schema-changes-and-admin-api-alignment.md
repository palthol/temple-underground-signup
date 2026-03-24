# Schema Changes and Admin API Alignment (Current Truth = Migrations 0001-0007)

This document compares the prior process documentation in `docs/(working) operations-table-process-map.md` against the current schema represented by:

- `supabase/migrations/0001_foundation_schema.sql`
- `supabase/migrations/0002_business_logic_and_affiliations.sql`
- `supabase/migrations/0003_security_hardening.sql`
- `supabase/migrations/0004_reporting_views_and_monitoring.sql`
- `supabase/migrations/0005_charge_adjustments.sql`
- `supabase/migrations/0006_refunds_merge_upgrade_rpcs.sql`
- `supabase/migrations/0007_fix_entitlements_merge_credits_grants.sql`

The schema above is treated as the intended source of truth.

---

## 1) Changes vs Previous Operations Map

Previous doc baseline: `docs/(working) operations-table-process-map.md`.

### Added process areas not captured in previous doc

1. **Charge Adjustments / Write-Offs**
   - Added table: `charge_adjustments`
   - Added enforcement triggers/functions:
     - `enforce_charge_adjustment_totals()`
     - `enforce_affiliate_application_totals()`
   - Impact: net due now explicitly supports write-offs in addition to affiliate credits.

2. **Payment Refund Operations**
   - Added table: `payment_refunds`
   - Added RPC: `record_payment_refund(...)`
   - Behavior:
     - Refund creates `payment_refunds` row (idempotency supported by `idempotency_key`).
     - Refund reduces `payment_allocations` FIFO.
     - Charges can reopen (`paid` -> `open`) when allocations fall below net due.
     - Full cumulative refund sets `payments.status = 'refunded'` (added in migration `0007`).

3. **Participant Merge / Canonicalization**
   - Added columns on `participants`:
     - `merged_into_participant_id`
     - `merged_at`
   - Added RPC: `merge_participants(...)`
   - Behavior: moves references to canonical participant and marks duplicate as merged (no hard delete).
   - `0007` improvement: dedupes conflicting active `affiliate_referrals` rows after merge.

4. **Subscription Upgrade with Proration**
   - Added RPC: `upgrade_subscription_prorated(...)`
   - Behavior: upgrade-only flow (new plan must be higher price), creates prorated delta charge, updates subscription plan.

5. **Monitoring Views**
   - Added views:
     - `view_orphan_waivers`
     - `view_orphan_waiver_summary`
   - Operational use: identify waiver participants not linked into billing account membership.

### Changed logic compared to earlier schema behavior

1. **Entitlement remaining math fixed (`0007`)**
   - `participant_entitlement_status.remaining` now aligns with `has_availability` for limited plans:
   - Remaining = `max(0, limit - usage - credits_available)`.

2. **Affiliate credit application headroom fixed (`0007`)**
   - `apply_credits_to_account(...)` now caps by `view_charge_net.net_due_cents` (write-off aware), not gross charge amount.

3. **Function exposure hardened (`0007`)**
   - Internal billing/affiliate functions revoked from `public`, `anon`, `authenticated`.
   - Execute privilege granted to `service_role` only.

### Existing groups from prior doc that still remain valid

- Intake identity and billing binding: `participants`, `accounts`, `account_members`
- Plan setup: `plan_definitions`, `plan_entitlements`
- Enrollment: `subscriptions`
- Billing core ledger: `charges`, `payments`, `payment_allocations`
- Attendance and entitlement usage: `schedule_templates`, `sessions`, `attendance_records`, `private_usage`, `entitlement_credits`, `access_overrides`
- Waiver/compliance: `waivers`, `audit_trails`, `emergency_contacts`, `waiver_medical_histories`
- Affiliate/family structures: `participant_relationships`, `affiliate_referrals`, `affiliate_credits`, `affiliate_credit_applications`
- Admin access control: `app_admin`, `private.is_admin()`, admin-only RLS policies

---

## 2) Current Schema Documentation (Canonical Operational Model)

### A. Intake and Billing Identity

- Tables: `participants`, `accounts`, `account_members`
- Purpose: identity capture + payer relationship modeling
- Key integrity:
  - unique member binding per `(account_id, participant_id)`
  - account-member role checks (`member|payer|guardian`)

### B. Plan and Enrollment

- Tables: `plan_definitions`, `plan_entitlements`, `subscriptions`
- Purpose: define plans and attach participants to plans
- Key integrity:
  - entitlement constraints for `scope`, `unit`, `limit_type`, quantity logic
  - subscription status/date constraints

### C. Billing Ledger and Net Due

- Core tables: `charges`, `payments`, `payment_allocations`
- Adjustment tables: `affiliate_credit_applications`, `charge_adjustments`, `payment_refunds`
- Net due model:
  - `view_charge_net.net_due_cents = gross - affiliate credits - write_offs`
- Key operational rules:
  - adjustments + affiliate credits cannot exceed gross (trigger-enforced)
  - refund cannot exceed payment amount or payment allocations

### D. Attendance and Entitlements

- Tables: `schedule_templates`, `sessions`, `attendance_records`, `private_usage`, `entitlement_credits`, `access_overrides`
- View/function:
  - `participant_entitlement_status`
  - `can_attend_group_session(...)`
- Behavior:
  - usage tracked by attendance/private minutes
  - credits and override affect access availability

### E. Waiver and Compliance

- Tables: `waivers`, `audit_trails`, `emergency_contacts`, `waiver_medical_histories`
- View: `view_waiver_documents`
- Purpose: legal signature + medical/contact records + audit linkage

### F. Affiliate and Family

- Tables: `participant_relationships`, `affiliate_referrals`, `affiliate_credits`, `affiliate_credit_applications`
- Functions:
  - `create_affiliation(...)`
  - `record_payment_affiliate_credits(...)`
  - `get_referrer_credit_balance(...)`
  - `apply_credits_to_account(...)`

### G. Lifecycle Corrections and Data Hygiene

- Participant dedupe:
  - `merge_participants(...)`
  - `participants.merged_into_participant_id`, `participants.merged_at`
- Plan lifecycle change:
  - `upgrade_subscription_prorated(...)`

### H. Reporting and Monitoring Views

- Billing views:
  - `view_member_payment_board`
  - `view_member_payment_reminders`
  - `view_charge_net`
- Waiver and monitoring views:
  - `view_waiver_documents`
  - `view_orphan_waivers`
  - `view_orphan_waiver_summary`
- Entitlement view:
  - `participant_entitlement_status`

### I. Security and Access

- `app_admin` + `private.is_admin()` based RLS policy pattern
- Broad table RLS enabled with admin-only policy checks
- Sensitive RPCs restricted to `service_role` execute (migration `0007`)

---

## 3) Admin API Endpoint to Schema Alignment

Reference doc: `docs/admin-api.md`.

### Endpoint coverage table

| Endpoint | Schema objects required | Match status | Notes |
|---|---|---|---|
| `GET /api/admin/waivers/:id` | `waivers`, `audit_trails` (+ storage URLs in columns) | **Match** | Route reads waiver + latest audit and signs URLs; schema supports it. |
| `POST /api/admin/billing/charge-adjustments` | `charge_adjustments`, trigger checks, `view_charge_net` downstream | **Match** | Write-off-only design matches constraint `adjustment_type in ('write_off')`. |
| `POST /api/admin/billing/payment-refunds` | `payment_refunds`, `payment_allocations`, `charges`, `view_charge_net`, `record_payment_refund(...)` | **Match** | Behavior in doc matches RPC, including idempotency and status transition to `refunded` on full refund. |
| `POST /api/admin/billing/subscription-upgrade` | `subscriptions`, `plan_definitions`, `charges`, `upgrade_subscription_prorated(...)` | **Match** | Upgrade-only and prorated delta logic exist in RPC. |
| `POST /api/admin/participants/merge` | `merge_participants(...)`, participant merge columns, dependent FK tables | **Match** | RPC includes FK repointing + merged marker behavior and affiliate dedupe fix. |
| `GET /api/admin/reporting/views/:slug` | `view_member_payment_board`, `view_member_payment_reminders`, `view_orphan_waivers`, `view_orphan_waiver_summary`, `view_charge_net`, `view_waiver_documents`, `participant_entitlement_status` | **Match** | All documented slugs map to schema objects that exist. |

### Conventions in `docs/admin-api.md` vs schema

- Service-role-only execution for internal RPCs: **Match** (explicit revoke/grant in migration `0007`).
- Partial payment and net due guidance using `view_charge_net`: **Match**.
- Refund idempotency guidance: **Match** (`payment_refunds.idempotency_key` unique when present).

### Notes and caveats

1. The API route implementations use service-role Supabase client for admin endpoints, which is consistent with function privilege hardening.
2. Any client/UI that builds allocation workflows should enforce net-due and payment-allocation caps before writing, as the doc states.
3. Reporting endpoint is schema-aligned and slug whitelist matches currently defined views.

---

## 4) Conclusion

Using migrations `0001` through `0007` as the intended schema, the admin API documentation in `docs/admin-api.md` is aligned with current database design and RPC behavior.

The previous operations map remains directionally correct for core flows, but it should be considered incomplete unless it includes:

- write-offs/adjustments,
- payment refunds,
- participant merge/canonicalization,
- subscription proration upgrades, and
- orphan-waiver monitoring.
