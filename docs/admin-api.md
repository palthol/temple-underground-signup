# Admin API — Temple Underground

All admin routes require the **`x-admin-key`** header matching **`ADMIN_API_KEY`** on the API server. Use HTTPS in production; never expose the admin key in public frontends (the optional `apps/dashboard` merge UI is for trusted operators only).

**Base URL:** same host as `services/api` (e.g. `http://localhost:3001`).

---

## Conventions

| Topic | Rule |
|--------|------|
| **Auth** | Header `x-admin-key: <ADMIN_API_KEY>` |
| **Supabase** | Server uses **service role**; billing/affiliate RPCs (`record_payment_refund`, `merge_participants`, `upgrade_subscription_prorated`, `generate_monthly_charges`, `create_affiliation`, `record_payment_affiliate_credits`, `get_referrer_credit_balance`, `apply_credits_to_account`, `can_attend_group_session`) are **service_role execute only** (migration `0007`) |
| **Idempotency** | `POST .../payment-refunds` accepts optional `idempotency_key` (unique when set); replays return the same `refund_id` |
| **Backdated charges** | When inserting charges manually (SQL or future endpoint), set `coverage_start`, `coverage_end`, and `due_at` to the real period; add a `notes` reason (e.g. entered after class) |
| **Partial payments** | Sum of `payment_allocations` for a charge must not exceed **net due** from `view_charge_net` (`gross - affiliate credits - write-offs`). Sum of allocations per `payment_id` must not exceed `payments.amount_cents`. Enforce in app logic when building allocation UIs |
| **Card / invoice** | Prefer exact-amount payment links; if overcharged, record a **refund** for the difference (no wallet / unapplied credit) |

---

## Endpoints

### `GET /api/admin/waivers/:id`

Existing: waiver metadata + signed URLs for PDF and signature.

---

### `POST /api/admin/billing/charge-adjustments`

Insert a **write-off** row (`charge_adjustments`). Reduces **net due** via `view_charge_net` (with affiliate credits).

**Body (JSON):**

```json
{
  "charge_id": "uuid",
  "amount_cents": 2500,
  "reason": "Hardship — agreed balance reduction",
  "created_by": "optional string"
}
```

**Response:** `{ "ok": true, "id": "<adjustment uuid>" }`

**Errors:** DB trigger if `affiliate_credit_applications + write-offs > charge.amount_cents`.

---

### `POST /api/admin/billing/payment-refunds`

Calls RPC `record_payment_refund`: inserts `payment_refunds`, shrinks `payment_allocations` FIFO, reopens `charges.status` from `paid` → `open` when allocations no longer cover net due. When cumulative refunds for the payment reach the full payment amount, `payments.status` is set to **`refunded`**.

**Body (JSON):**

```json
{
  "payment_id": "uuid",
  "amount_cents": 5000,
  "reason": "Medical partial refund",
  "idempotency_key": "optional-unique-string",
  "created_by": "optional override; defaults to admin_api"
}
```

**Response:** `{ "ok": true, "refund_id": "<uuid>" }`

**Validation (RPC):** payment must be `succeeded`; refund total ≤ payment amount; refund ≤ sum of allocations for that payment.

---

### `POST /api/admin/billing/subscription-upgrade`

Calls RPC `upgrade_subscription_prorated`: **upgrade only** (new plan `price_cents` > old). Inserts a **prorated delta** `charges` row for the rest of the current period (from `effective_date` or today through period end) and sets `subscriptions.plan_definition_id`.

**Body (JSON):**

```json
{
  "subscription_id": "uuid",
  "new_plan_definition_id": "uuid",
  "effective_date": "YYYY-MM-DD optional; defaults to current date in DB"
}
```

**Response:** `{ "ok": true, "proration_charge_id": "<uuid>" }`

---

### `POST /api/admin/participants/merge`

Calls RPC `merge_participants`: repoints FKs from duplicate → canonical; sets `participants.merged_into_participant_id` and `merged_at` on the duplicate. Does **not** delete rows. If merging produces duplicate **active** `affiliate_referrals` rows for the same (referrer, referred), extras are ended (`status = ended`, `ended_at` set) so the partial unique index stays valid.

**Body (JSON):**

```json
{
  "canonical_participant_id": "uuid",
  "duplicate_participant_id": "uuid"
}
```

**Response:** `{ "ok": true }`

---

## Database reporting (authenticated admins)

- **`view_charge_net`:** `gross_cents`, `credit_applied_cents` (affiliate), `write_off_cents`, `net_due_cents`
- **`view_member_payment_board` / `view_member_payment_reminders`:** use `net_due_cents` automatically via `view_charge_net`
- **`participant_entitlement_status`:** for limited plans, `remaining` = `max(0, limit - usage - credits_available)` so it matches `has_availability` (migration `0007`)

### `GET /api/admin/reporting/views/:slug`

Read-only preview of a **whitelisted** reporting view. Uses the API’s **service role** client (bypasses RLS). Intended for trusted operators.

**Query:** `limit` — optional, default `200`, max `500`.

**Slugs → Postgres objects:**

| Slug | View / relation |
|------|------------------|
| `payment-board` | `view_member_payment_board` |
| `payment-reminders` | `view_member_payment_reminders` |
| `orphan-waivers` | `view_orphan_waivers` |
| `orphan-waiver-summary` | `view_orphan_waiver_summary` |
| `charge-net` | `view_charge_net` |
| `waiver-documents` | `view_waiver_documents` |
| `participant-entitlements` | `participant_entitlement_status` |

**Response:** `{ "ok": true, "slug", "view", "limit", "rowCount", "rows": [ ... ] }`

**Errors:** `400` with `unknown_view` and `allowed: [...]` if slug is not whitelisted; `400` if PostgREST/DB rejects the select.

---

## Waiver PDF routes

Mounted under `/api/waivers/*` with the same `requireAdmin` pattern where applicable (see `services/api/src/index.js`).

---

## Local dashboard (`apps/dashboard`)

- **Sidebar layout:** **Analysis** (whitelisted reporting views, ordered for operations — payment board, charge net, reminders, entitlements, waivers, orphans) is the default experience; **Administration** groups **Merge**, **Write-off**, **Refund**, **Upgrade**, and **Waiver** URLs.
- Sticky header: API base + admin key. Changing analysis view (or pasting the key) auto-loads data; **Refresh** re-fetches with the current row limit (max 500).
- `npm run dev:dashboard` (from repo root; run `npm install` in the monorepo first)
- Set `VITE_API_BASE_URL` if the API is not on `http://localhost:3001`
- Paste **x-admin-key** only in trusted sessions; do not commit keys
