-- Option B: explicit charge adjustments (write-offs) with audit fields.
-- Net due = gross - affiliate_credit_applications - write_offs.

create table if not exists public.charge_adjustments (
  id uuid primary key default gen_random_uuid(),
  charge_id uuid not null references public.charges(id) on delete cascade,
  adjustment_type text not null default 'write_off',
  amount_cents integer not null,
  reason text not null,
  created_at timestamptz not null default now(),
  created_by text,
  constraint check_charge_adjustment_type check (adjustment_type in ('write_off')),
  constraint check_charge_adjustment_amount check (amount_cents > 0)
);

create index if not exists idx_charge_adjustments_charge_id on public.charge_adjustments(charge_id);

-- Ensure write-offs + affiliate credits do not exceed gross (net stays >= 0)
create or replace function public.enforce_charge_adjustment_totals()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_cid uuid;
  v_gross integer;
  v_affiliate integer;
  v_writeoffs integer;
begin
  v_cid := coalesce(new.charge_id, old.charge_id);
  select c.amount_cents into v_gross
  from public.charges c
  where c.id = v_cid;

  if v_gross is null then
    return coalesce(new, old);
  end if;

  select coalesce(sum(aca.amount_cents), 0)::integer into v_affiliate
  from public.affiliate_credit_applications aca
  where aca.charge_id = v_cid;

  select coalesce(sum(ca.amount_cents), 0)::integer into v_writeoffs
  from public.charge_adjustments ca
  where ca.charge_id = v_cid
    and ca.adjustment_type = 'write_off';

  if v_affiliate + v_writeoffs > v_gross then
    raise exception 'Adjustments and affiliate credits (%) exceed charge gross (%) for charge %',
      v_affiliate + v_writeoffs, v_gross, v_cid;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_charge_adjustments_totals on public.charge_adjustments;
create trigger trg_charge_adjustments_totals
  after insert or update or delete on public.charge_adjustments
  for each row execute function public.enforce_charge_adjustment_totals();

-- Also validate when affiliate applications change
create or replace function public.enforce_affiliate_application_totals()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_charge_id uuid;
  v_gross integer;
  v_affiliate integer;
  v_writeoffs integer;
begin
  v_charge_id := coalesce(new.charge_id, old.charge_id);
  select c.amount_cents into v_gross from public.charges c where c.id = v_charge_id;
  if v_gross is null then
    return coalesce(new, old);
  end if;
  select coalesce(sum(aca.amount_cents), 0)::integer into v_affiliate
  from public.affiliate_credit_applications aca where aca.charge_id = v_charge_id;
  select coalesce(sum(ca.amount_cents), 0)::integer into v_writeoffs
  from public.charge_adjustments ca
  where ca.charge_id = v_charge_id and ca.adjustment_type = 'write_off';
  if v_affiliate + v_writeoffs > v_gross then
    raise exception 'Affiliate credits and write-offs exceed charge gross for charge %', v_charge_id;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_affiliate_credit_apps_totals on public.affiliate_credit_applications;
create trigger trg_affiliate_credit_apps_totals
  after insert or update or delete on public.affiliate_credit_applications
  for each row execute function public.enforce_affiliate_application_totals();

alter table public.charge_adjustments enable row level security;

create policy "admin_all_charge_adjustments" on public.charge_adjustments
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

comment on table public.charge_adjustments is
  'Explicit charge-level adjustments; write_off reduces collectible amount (Option B reporting).';

-- Replacing view_charge_net adds columns vs 0002; Postgres forbids changing column layout with CREATE OR REPLACE.
-- Drop dependents first (order: reminders -> board -> charge_net), then recreate from 0004 + new definition.
drop view if exists public.view_member_payment_reminders;
drop view if exists public.view_member_payment_board;
drop view if exists public.view_charge_net;

-- Net due view: gross - affiliate applications - write-offs
create view public.view_charge_net
  with (security_invoker = on) as
select
  c.id as charge_id,
  c.account_id,
  c.subscription_id,
  c.amount_cents as gross_cents,
  coalesce(aca.credit_applied_cents, 0)::integer as credit_applied_cents,
  coalesce(adj.write_off_cents, 0)::integer as write_off_cents,
  (c.amount_cents
    - coalesce(aca.credit_applied_cents, 0)
    - coalesce(adj.write_off_cents, 0))::integer as net_due_cents,
  c.status,
  c.due_at
from public.charges c
left join (
  select
    aca.charge_id,
    coalesce(sum(aca.amount_cents), 0)::integer as credit_applied_cents
  from public.affiliate_credit_applications aca
  group by aca.charge_id
) aca on aca.charge_id = c.id
left join (
  select
    ca.charge_id,
    coalesce(sum(ca.amount_cents), 0)::integer as write_off_cents
  from public.charge_adjustments ca
  where ca.adjustment_type = 'write_off'
  group by ca.charge_id
) adj on adj.charge_id = c.id;

-- Recreate billing board + reminders (same definitions as 0004; depend on new view_charge_net shape)
create view public.view_member_payment_board
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

create view public.view_member_payment_reminders
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

revoke all on public.view_member_payment_board from public;
revoke all on public.view_member_payment_reminders from public;
grant select on public.view_member_payment_board to authenticated;
grant select on public.view_member_payment_reminders to authenticated;
