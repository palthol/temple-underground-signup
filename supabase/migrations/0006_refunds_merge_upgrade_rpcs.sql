-- Payment refunds (partial), participant merge, subscription upgrade proration.
-- Callable via Supabase RPC or service-role API.

-- -----------------------------------------------------------------------------
-- payment_refunds
-- -----------------------------------------------------------------------------
create table if not exists public.payment_refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  amount_cents integer not null,
  reason text not null,
  idempotency_key text,
  created_at timestamptz not null default now(),
  created_by text,
  constraint check_refund_amount_positive check (amount_cents > 0),
  constraint payment_refunds_idempotency_key_unique unique (idempotency_key)
);

create index if not exists idx_payment_refunds_payment_id on public.payment_refunds(payment_id);

alter table public.payment_refunds enable row level security;

create policy "admin_all_payment_refunds" on public.payment_refunds
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

comment on table public.payment_refunds is
  'Partial or full refunds against a payment; allocations are reduced FIFO so charges can reopen.';

-- -----------------------------------------------------------------------------
-- participants merge markers (never delete waiver-linked rows)
-- -----------------------------------------------------------------------------
alter table public.participants
  add column if not exists merged_into_participant_id uuid references public.participants(id) on delete set null;

alter table public.participants
  add column if not exists merged_at timestamptz;

create index if not exists idx_participants_merged_into on public.participants(merged_into_participant_id)
  where merged_into_participant_id is not null;

comment on column public.participants.merged_into_participant_id is
  'If set, this row is a duplicate merged into the canonical participant; do not use for new operations.';

-- -----------------------------------------------------------------------------
-- record_payment_refund: insert refund + shrink payment_allocations (FIFO)
-- -----------------------------------------------------------------------------
create or replace function public.record_payment_refund(
  p_payment_id uuid,
  p_amount_cents integer,
  p_reason text,
  p_created_by text default null,
  p_idempotency_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment record;
  v_refunded_so_far integer;
  v_remaining integer;
  r_alloc record;
  v_refund_id uuid;
  v_net integer;
  v_pay_allocated integer;
  v_on_charge integer;
begin
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Refund amount must be positive';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Refund reason is required';
  end if;

  if p_idempotency_key is not null and length(trim(p_idempotency_key)) > 0 then
    select pr.id into v_refund_id
    from public.payment_refunds pr
    where pr.idempotency_key = p_idempotency_key;
    if v_refund_id is not null then
      return v_refund_id;
    end if;
  end if;

  select p.id, p.amount_cents, p.status, p.account_id
  into v_payment
  from public.payments p
  where p.id = p_payment_id;

  if v_payment.id is null then
    raise exception 'Payment not found: %', p_payment_id;
  end if;
  if v_payment.status <> 'succeeded' then
    raise exception 'Refunds only allowed for succeeded payments';
  end if;

  select coalesce(sum(pr.amount_cents), 0)::integer into v_refunded_so_far
  from public.payment_refunds pr
  where pr.payment_id = p_payment_id;

  if v_refunded_so_far + p_amount_cents > v_payment.amount_cents then
    raise exception 'Refund total would exceed payment amount';
  end if;

  select coalesce(sum(pa.amount_cents), 0)::integer into v_pay_allocated
  from public.payment_allocations pa
  where pa.payment_id = p_payment_id;

  if p_amount_cents > v_pay_allocated then
    raise exception 'Refund amount (%) exceeds allocated amount (%) for this payment', p_amount_cents, v_pay_allocated;
  end if;

  insert into public.payment_refunds (
    payment_id, amount_cents, reason, created_by, idempotency_key
  )
  values (
    p_payment_id,
    p_amount_cents,
    p_reason,
    p_created_by,
    nullif(trim(p_idempotency_key), '')
  )
  returning id into v_refund_id;

  v_remaining := p_amount_cents;

  for r_alloc in
    select pa.id, pa.charge_id, pa.amount_cents
    from public.payment_allocations pa
    where pa.payment_id = p_payment_id
    order by pa.created_at asc, pa.id asc
  loop
    exit when v_remaining <= 0;
    if r_alloc.amount_cents <= v_remaining then
      v_remaining := v_remaining - r_alloc.amount_cents;
      delete from public.payment_allocations where id = r_alloc.id;
    else
      update public.payment_allocations
      set amount_cents = r_alloc.amount_cents - v_remaining,
          updated_at = now()
      where id = r_alloc.id;
      v_remaining := 0;
    end if;

    -- Reopen charge if allocations no longer cover net due
    select vcn.net_due_cents into v_net
    from public.view_charge_net vcn
    where vcn.charge_id = r_alloc.charge_id;

    select coalesce(sum(pa2.amount_cents), 0)::integer into v_on_charge
    from public.payment_allocations pa2
    where pa2.charge_id = r_alloc.charge_id;

    if v_net is not null and v_on_charge < v_net then
      update public.charges c
      set status = 'open', updated_at = now()
      where c.id = r_alloc.charge_id and c.status = 'paid';
    end if;
  end loop;

  return v_refund_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- merge_participants: repoint FKs to canonical; mark duplicate merged
-- -----------------------------------------------------------------------------
create or replace function public.merge_participants(
  p_canonical_participant_id uuid,
  p_duplicate_participant_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_canonical_participant_id is null or p_duplicate_participant_id is null then
    raise exception 'Both participant ids are required';
  end if;
  if p_canonical_participant_id = p_duplicate_participant_id then
    raise exception 'Cannot merge a participant into itself';
  end if;

  if not exists (select 1 from public.participants p where p.id = p_canonical_participant_id) then
    raise exception 'Canonical participant not found';
  end if;
  if not exists (select 1 from public.participants p where p.id = p_duplicate_participant_id) then
    raise exception 'Duplicate participant not found';
  end if;

  if exists (
    select 1 from public.participants p
    where p.id = p_duplicate_participant_id and p.merged_into_participant_id is not null
  ) then
    raise exception 'Duplicate participant is already merged';
  end if;

  -- account_members: drop duplicate row if canonical already member of same account
  delete from public.account_members am_dup
  using public.account_members am_can
  where am_dup.participant_id = p_duplicate_participant_id
    and am_can.account_id = am_dup.account_id
    and am_can.participant_id = p_canonical_participant_id;

  update public.account_members
  set participant_id = p_canonical_participant_id, updated_at = now()
  where participant_id = p_duplicate_participant_id;

  update public.subscriptions
  set participant_id = p_canonical_participant_id, updated_at = now()
  where participant_id = p_duplicate_participant_id;

  update public.waivers
  set participant_id = p_canonical_participant_id
  where participant_id = p_duplicate_participant_id;

  update public.audit_trails
  set participant_id = p_canonical_participant_id
  where participant_id = p_duplicate_participant_id;

  update public.emergency_contacts
  set participant_id = p_canonical_participant_id
  where participant_id = p_duplicate_participant_id;

  update public.attendance_records
  set participant_id = p_canonical_participant_id, updated_at = now()
  where participant_id = p_duplicate_participant_id;

  update public.private_usage
  set participant_id = p_canonical_participant_id, updated_at = now()
  where participant_id = p_duplicate_participant_id;

  update public.entitlement_credits
  set participant_id = p_canonical_participant_id, updated_at = now()
  where participant_id = p_duplicate_participant_id;

  update public.access_overrides
  set participant_id = p_canonical_participant_id, updated_at = now()
  where participant_id = p_duplicate_participant_id;

  update public.participant_relationships
  set participant_a_id = p_canonical_participant_id, updated_at = now()
  where participant_a_id = p_duplicate_participant_id
    and participant_b_id <> p_canonical_participant_id;

  update public.participant_relationships
  set participant_b_id = p_canonical_participant_id, updated_at = now()
  where participant_b_id = p_duplicate_participant_id
    and participant_a_id <> p_canonical_participant_id;

  delete from public.participant_relationships
  where participant_a_id = p_canonical_participant_id
    and participant_b_id = p_canonical_participant_id;

  update public.affiliate_referrals
  set referrer_participant_id = p_canonical_participant_id, updated_at = now()
  where referrer_participant_id = p_duplicate_participant_id;

  update public.affiliate_referrals
  set referred_participant_id = p_canonical_participant_id, updated_at = now()
  where referred_participant_id = p_duplicate_participant_id;

  update public.affiliate_credits
  set referrer_participant_id = p_canonical_participant_id
  where referrer_participant_id = p_duplicate_participant_id;

  update public.participants
  set merged_into_participant_id = p_canonical_participant_id,
      merged_at = now()
  where id = p_duplicate_participant_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- upgrade_subscription_prorated: immediate plan change + one-time delta charge
-- -----------------------------------------------------------------------------
create or replace function public.upgrade_subscription_prorated(
  p_subscription_id uuid,
  p_new_plan_definition_id uuid,
  p_effective_date date default (current_date)
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub record;
  v_old_price integer;
  v_new_price integer;
  v_period_start date;
  v_period_end date;
  v_days_total integer;
  v_days_remain integer;
  v_delta integer;
  v_charge_id uuid;
  v_eff date;
begin
  v_eff := coalesce(p_effective_date, (current_date));

  select
    s.id,
    s.account_id,
    s.participant_id,
    s.plan_definition_id,
    s.starts_at,
    s.ends_at,
    s.status
  into v_sub
  from public.subscriptions s
  where s.id = p_subscription_id;

  if v_sub.id is null then
    raise exception 'Subscription not found';
  end if;
  if v_sub.status <> 'active' then
    raise exception 'Only active subscriptions can be upgraded';
  end if;
  if v_sub.ends_at is not null and v_sub.ends_at < v_eff then
    raise exception 'Subscription has already ended before effective date';
  end if;

  select pd.price_cents into v_old_price
  from public.plan_definitions pd
  where pd.id = v_sub.plan_definition_id;

  select pd.price_cents into v_new_price
  from public.plan_definitions pd
  where pd.id = p_new_plan_definition_id;

  if v_new_price is null then
    raise exception 'New plan not found';
  end if;
  if v_new_price <= v_old_price then
    raise exception 'New plan price must be greater than current plan (upgrade only)';
  end if;

  select c.coverage_start, c.coverage_end
  into v_period_start, v_period_end
  from public.charges c
  where c.subscription_id = p_subscription_id
    and c.status <> 'void'
    and c.coverage_start <= v_eff
    and c.coverage_end >= v_eff
  order by c.coverage_end desc
  limit 1;

  if v_period_start is null then
    v_period_start := date_trunc('month', v_eff)::date;
    v_period_end := (v_period_start + interval '1 month - 1 day')::date;
  end if;

  if v_eff > v_period_end then
    raise exception 'Effective date is after current billing period end';
  end if;

  v_days_total := (v_period_end - v_period_start + 1);
  v_days_remain := (v_period_end - v_eff + 1);

  if v_days_total <= 0 or v_days_remain <= 0 then
    raise exception 'Invalid billing period for proration';
  end if;

  v_delta := round((v_new_price - v_old_price)::numeric * v_days_remain::numeric / v_days_total::numeric)::integer;

  if v_delta <= 0 then
    raise exception 'Computed proration amount is not positive';
  end if;

  insert into public.charges (
    account_id,
    subscription_id,
    amount_cents,
    currency,
    coverage_start,
    coverage_end,
    due_at,
    status,
    notes
  )
  values (
    v_sub.account_id,
    p_subscription_id,
    v_delta,
    'USD',
    v_eff,
    v_period_end,
    v_eff,
    'open',
    format(
      'Prorated plan upgrade (%s days of %s in period %s–%s)',
      v_days_remain,
      v_days_total,
      v_period_start,
      v_period_end
    )
  )
  returning id into v_charge_id;

  update public.subscriptions
  set plan_definition_id = p_new_plan_definition_id,
      updated_at = now()
  where id = p_subscription_id;

  return v_charge_id;
end;
$$;

-- Service role / backend only (avoid exposing SECURITY DEFINER RPCs to all authenticated users).
grant execute on function public.record_payment_refund(uuid, integer, text, text, text) to service_role;
grant execute on function public.merge_participants(uuid, uuid) to service_role;
grant execute on function public.upgrade_subscription_prorated(uuid, uuid, date) to service_role;

alter function public.enforce_charge_adjustment_totals() set search_path = public;
alter function public.enforce_affiliate_application_totals() set search_path = public;
