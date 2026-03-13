-- 0011_billing_views_and_grants.sql
-- Purpose:
--   1) Member billing board view (sheet-like)
--   2) Reminder queue view (overdue + due soon)
--   3) Explicit grants for API roles
--
-- Supabase conventions used:
--   - create or replace view
--   - with (security_invoker = on) so RLS of querying user applies
--   - explicit revoke/grant
--   - idempotent / migration-safe structure

-- ============================================================================
-- 1) Billing board view
-- ============================================================================

create or replace view public.view_member_payment_board
with (security_invoker = on) as
with active_subscriptions as (
  select
    s.id as subscription_id,
    s.account_id,
    s.participant_id,
    s.plan_definition_id,
    pd.price_cents as base_price_cents
  from public.subscriptions s
  join public.plan_definitions pd on pd.id = s.plan_definition_id
  where s.status = 'active'
    and (s.ends_at is null or s.ends_at >= current_date)
),
latest_charge as (
  select distinct on (asub.participant_id)
    asub.participant_id,
    asub.account_id,
    asub.subscription_id,
    asub.base_price_cents,
    c.id as charge_id,
    c.amount_cents as charge_amount_cents,
    c.due_at,
    c.status as charge_status,
    c.created_at as charge_created_at
  from active_subscriptions asub
  left join public.charges c
    on c.subscription_id = asub.subscription_id
   and c.status <> 'void'
  order by
    asub.participant_id,
    c.due_at desc nulls last,
    c.created_at desc nulls last
),
allocations as (
  select
    pa.charge_id,
    coalesce(sum(pa.amount_cents), 0)::integer as allocated_cents
  from public.payment_allocations pa
  group by pa.charge_id
),
last_payment as (
  select
    pa.charge_id,
    max(p.paid_at)::date as paid_date
  from public.payment_allocations pa
  join public.payments p on p.id = pa.payment_id
  where p.status = 'succeeded'
  group by pa.charge_id
)
select
  p.id as participant_id,
  lc.account_id,
  p.full_name as name,
  (lc.base_price_cents / 100.0)::numeric(10,2) as base_price,
  (
    coalesce(vcn.net_due_cents, lc.charge_amount_cents, lc.base_price_cents) / 100.0
  )::numeric(10,2) as actual_price,
  (
    lc.charge_id is not null
    and (
      lc.charge_status = 'paid'
      or coalesce(a.allocated_cents, 0) >= coalesce(vcn.net_due_cents, lc.charge_amount_cents, lc.base_price_cents)
    )
  ) as paid,
  lp.paid_date,
  lc.due_at as next_due_date,
  case
    when lc.charge_id is null then null::integer
    when (
      lc.charge_status = 'paid'
      or coalesce(a.allocated_cents, 0) >= coalesce(vcn.net_due_cents, lc.charge_amount_cents, lc.base_price_cents)
    ) then 0
    else greatest((current_date - lc.due_at), 0)::integer
  end as days_late,
  lc.charge_id,
  coalesce(vcn.net_due_cents, lc.charge_amount_cents, lc.base_price_cents)::integer as expected_due_cents,
  coalesce(a.allocated_cents, 0)::integer as allocated_cents
from latest_charge lc
join public.participants p on p.id = lc.participant_id
left join allocations a on a.charge_id = lc.charge_id
left join last_payment lp on lp.charge_id = lc.charge_id
left join public.view_charge_net vcn on vcn.charge_id = lc.charge_id
order by
  paid asc,
  days_late desc nulls last,
  name;

comment on view public.view_member_payment_board is
'Member billing board: name, base/actual price, paid state, paid date, due date, and lateness metrics.';

-- ============================================================================
-- 2) Reminder queue view
--    - overdue: due date already passed and not fully paid
--    - due_soon: due within next 3 days and not fully paid
-- ============================================================================

create or replace view public.view_member_payment_reminders
with (security_invoker = on) as
select
  b.participant_id,
  b.account_id,
  b.name,
  b.base_price,
  b.actual_price,
  b.paid,
  b.paid_date,
  b.next_due_date,
  b.days_late,
  case
    when b.paid = true then 'ok'
    when b.next_due_date is null then 'no_charge'
    when b.next_due_date < current_date then 'overdue'
    when b.next_due_date <= current_date + 3 then 'due_soon'
    else 'ok'
  end as reminder_bucket
from public.view_member_payment_board b
where b.paid = false
  and b.next_due_date is not null
  and b.next_due_date <= current_date + 3
order by
  case
    when b.next_due_date < current_date then 1
    when b.next_due_date <= current_date + 3 then 2
    else 3
  end,
  b.next_due_date,
  b.name;

comment on view public.view_member_payment_reminders is
'Queue of members needing reminders (overdue and due soon) for daily digest automation.';

-- ============================================================================
-- 3) Grants
-- ============================================================================

revoke all on public.view_member_payment_board from public;
revoke all on public.view_member_payment_reminders from public;

grant select on public.view_member_payment_board to authenticated;
grant select on public.view_member_payment_reminders to authenticated;

-- Optional:
-- grant select on public.view_member_payment_board to anon;
-- grant select on public.view_member_payment_reminders to anon;