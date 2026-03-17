# Waiver Entrypoint Automation Checklist

This checklist defines the required actions when a waiver is submitted so every participant is tethered to billing identity and ready for future automations.

---

## Goal

Use waiver submission as the operational entrypoint that guarantees:

- a `participant` exists
- an `account` exists
- a `participant <-> account` link exists in `account_members`

This ensures downstream automations always have a stable anchor (`participant_id`, `account_id`).

---

## Required Action Flow (on successful waiver submit)

1. **Create or resolve participant**
   - Insert into `participants` if new.
   - If existing participant is found by trusted identity rule, reuse existing `participant_id`.

2. **Create or resolve account**
   - If participant has no billing account, create a new default `accounts` row.
   - If account already exists for this participant, reuse it.

3. **Bind participant to account**
   - Ensure a row exists in `account_members` with:
     - `account_id`
     - `participant_id`
     - role default: `member`
   - Use idempotent logic so repeated calls do not create duplicates.

4. **Write waiver records**
   - Persist `waivers` and related waiver domain records (`emergency_contacts`, `waiver_medical_histories`, `audit_trails`) as needed.

5. **Return tether identifiers**
   - Response should include:
     - `participant_id`
     - `account_id`
     - `account_member_id` (if needed by caller)

---

## Non-Goals at Waiver Time (do not force here)

- Auto-creating `subscriptions`
- Auto-creating `charges`
- Auto-creating `payments`

These should remain enrollment/billing decisions unless explicitly required by product policy.

---

## Idempotency and Safety Rules

- Re-running the flow must be safe.
- Respect `unique (account_id, participant_id)` in `account_members`.
- Prefer transaction boundaries so partial writes do not leave orphaned records.
- On failure, rollback and return actionable error context.

---

## Automation Readiness Checks

- [ ] Every waived participant resolves to an `account_id`.
- [ ] No participant has a waiver but lacks `account_members` linkage.
- [ ] API can fetch billing context from `participant_id` in one step.
- [ ] Backfill script exists for legacy waived participants missing account links.

---

## Suggested Implementation Tasks

- [ ] Add DB function or backend service: `create_or_bind_participant_account`.
- [ ] Call it in waiver submission pipeline after participant is confirmed.
- [ ] Add structured logs for participant/account binding outcomes.
- [ ] Add integration test: waiver submit creates/links account membership.
- [ ] Add monitoring query for orphan waivers.

---

## Monitoring Query (orphan waivers)

Use this periodically to find waived participants without billing linkage:

```sql
select distinct w.participant_id
from public.waivers w
left join public.account_members am on am.participant_id = w.participant_id
where am.id is null;
```

If rows are returned, run backfill to create and bind accounts for those participants.
