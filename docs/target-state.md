# API target state

The API remains the only backend and canonical Supabase migration owner.

## Intended outcomes

- Privileged writes are authenticated per staff identity and authorized by role.
- Multi-row financial and identity operations are transactional and idempotent.
- A supported scheduler invokes notification and monthly-charge endpoints with run
  tracking, duplicate suppression, and observable failures.
- Scheduling supports template CRUD and safe recurring-session generation.
- Payment-provider webhooks map atomically into payments, allocations, and receipts.
- Member-facing clients receive narrowly scoped endpoints; no service-role key reaches a
  browser.
- Clean installs, CI, integration tests, and a non-production validation environment are
  release gates.

## Milestones

1. Repair reproducibility, documentation, deployment inventory, and missing route tests.
2. Prove existing finance, subscription, scheduling, and notification workflows outside
   production.
3. Make payment and waiver write paths atomic/idempotent.
4. Add scheduling and billing automation.
5. Implement individual staff authorization, payment integration, and delivery services.

Execution order is maintained in `../work-queue/README.md`.
