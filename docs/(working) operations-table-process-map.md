# Operations Table Process Map

This document maps database tables to operational processes so intake, billing, and attendance flows are clear and repeatable.

---

## 1) Process-Level Table Groups

### A. Client Intake and Billing Identity

Purpose: Create a trainee and connect them to the payer account.

- `participants` (trainee identity)
- `accounts` (payer/billing entity)
- `account_members` (binds participant to account)

Required for operations: **Yes**

---

### B. Plan Catalog Setup

Purpose: Define the plans staff can assign during enrollment.

- `plan_definitions` (price and cadence)
- `plan_entitlements` (what the plan grants)

Required for operations: **Yes** (at least one active plan should exist before intake)

---

### C. Enrollment

Purpose: Put a participant on a plan under an account.

- `subscriptions`

Dependencies:
- Requires rows in `participants`, `accounts`, and `plan_definitions`.

Required for operations: **Yes**

---

### D. Billing Ledger

Purpose: Track what is owed and what was paid.

- `charges`
- `payments`
- `payment_allocations`

Dependencies:
- `charges` usually tied to `subscriptions` and `accounts`.
- `payment_allocations` requires existing `payments` and `charges`.

Required for operations:
- For dues visibility (`due_at`, overdue): **Yes** (`charges`)
- For paid status and paid date accuracy: **Yes** (`payments`, `payment_allocations`)

---

### E. Scheduling and Attendance

Purpose: Track actual training sessions and consumption of entitlements.

- `schedule_templates`
- `sessions`
- `attendance_records`
- `private_usage`
- `entitlement_credits`
- `access_overrides`

Required for operations: **Optional** for billing-only workflows, **required** for session access and usage tracking.

---

### F. Waiver and Compliance

Purpose: Legal and medical documentation.

- `waivers`
- `audit_trails`
- `emergency_contacts`
- `waiver_medical_histories`

Required for operations: **Operationally important**, but not required for billing math.

---

### G. Affiliate and Family Credits

Purpose: Referrals, family relationships, and credit applications.

- `participant_relationships`
- `affiliate_referrals`
- `affiliate_credits`
- `affiliate_credit_applications`

Required for operations: **Optional**

---

### H. Admin Access Control

Purpose: Authorize admin users under RLS.

- `app_admin`

Required for operations: **Required** for authenticated admin access patterns.

---

## 2) "Cannot Have One Without the Other" Relationships

- `account_members` requires both `participants` and `accounts`.
- `subscriptions` require `participants`, `accounts`, and `plan_definitions`.
- `charges` require `accounts` (and typically `subscriptions`).
- `payment_allocations` require both `payments` and `charges`.

---

## 3) Binding an Account to a Participant (Operational Plan)

### Goal

Ensure every trainee has a billing owner and can be enrolled without ad-hoc data entry.

### Transaction Order (single API transaction recommended)

1. Insert or find `participants` row.
2. Insert or find `accounts` row.
3. Upsert `account_members` with role (`member`, `payer`, or `guardian`).

If any step fails, rollback all steps.

### Minimum Validation Rules

- Participant:
  - `full_name` required
  - `date_of_birth` required
  - `email` required
- Account:
  - `status` defaults to `active`
  - At least one contact field should exist (name, phone, or email)
- Binding:
  - Enforce unique pair via `(account_id, participant_id)`
  - Role must be one of allowed enum-like values

### Operational Modes

- **Single-payer account (default):**
  - One account pays for one participant.
- **Family account:**
  - One account with many participants via `account_members`.
- **Guardian payer model:**
  - Keep participant as member and set payer/guardian role on the adult account member.

### Recommended API Shape

- Endpoint intent: `create_or_bind_participant_account`
- Input:
  - `participant`: identity fields
  - `account`: payer fields
  - `role`: `member|payer|guardian`
- Output:
  - `participant_id`
  - `account_id`
  - `account_member_id`

---

## 4) What Must Be Seeded Before Intake

Seed before staff starts data entry:

1. `plan_definitions`
2. `plan_entitlements` (if entitlement checks are used)

Not required to pre-seed:

- `participants`, `accounts`, `account_members`, `subscriptions`, `charges`, `payments`
- These should be created as real operational data.

---

## 5) First Operational Checklist

1. Confirm at least one active row in `plan_definitions`.
2. Confirm matching entitlements exist for that plan.
3. Intake creates `participants` + `accounts` + `account_members`.
4. Enrollment creates `subscriptions`.
5. Billing creates `charges` (manual or `generate_monthly_charges()`).
6. Payment collection writes `payments` + `payment_allocations`.

This sequence keeps `view_member_payment_board` and reminders meaningful from day one.
