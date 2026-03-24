-- 0007: Fix entitlement remaining vs has_availability, merge affiliate dedupe,
--       apply_credits headroom from view_charge_net (write-off aware),
--       record_payment_refund -> payments.status = refunded when fully refunded,
--       revoke PUBLIC execute on internal billing/affiliate functions (service_role only).

-- =============================================================================
-- 1. participant_entitlement_status: remaining aligned with has_availability
--    has_availability uses (usage + credits) < quantity  =>  credits count toward limit.
--    remaining = max(0, quantity - usage - credits) for limited group/private.
-- =============================================================================

create or replace view public.participant_entitlement_status
  with (security_invoker = on) as
with active_subscriptions as (
  select
    s.id as subscription_id,
    s.participant_id,
    s.plan_definition_id,
    s.starts_at,
    s.ends_at,
    s.status as subscription_status
  from public.subscriptions s
  where s.status = 'active'
    and (s.ends_at is null or s.ends_at >= current_date)
),
participant_entitlements as (
  select
    asub.subscription_id,
    asub.participant_id,
    pe.id as entitlement_id,
    pe.scope,
    pe.unit,
    pe.limit_type,
    pe.quantity,
    pe.reset_rule,
    pe.applies_to,
    asub.starts_at as subscription_starts_at
  from active_subscriptions asub
  join public.plan_entitlements pe on pe.plan_definition_id = asub.plan_definition_id
),
group_usage as (
  select
    pe.participant_id,
    pe.entitlement_id,
    pe.reset_rule,
    case
      when pe.reset_rule = 'calendar_week' then
        count(*) filter (
          where ar.status = 'present'
            and date_trunc('week', s.starts_at) = date_trunc('week', current_date)
        )
      else
        count(*) filter (where ar.status = 'present')
    end as sessions_used
  from participant_entitlements pe
  left join public.attendance_records ar on ar.participant_id = pe.participant_id
  left join public.sessions s on s.id = ar.session_id
  where pe.scope = 'group' and pe.unit = 'session'
  group by pe.participant_id, pe.entitlement_id, pe.reset_rule
),
private_usage_calc as (
  select
    pe.participant_id,
    pe.entitlement_id,
    pe.reset_rule,
    case
      when pe.reset_rule = 'calendar_week' then
        coalesce(sum(pu.minutes_used) filter (
          where date_trunc('week', pu.occurred_at) = date_trunc('week', current_date)
        ), 0)
      else
        coalesce(sum(pu.minutes_used), 0)
    end as minutes_used
  from participant_entitlements pe
  left join public.private_usage pu on pu.participant_id = pe.participant_id
  where pe.scope = 'private' and pe.unit = 'minutes'
  group by pe.participant_id, pe.entitlement_id, pe.reset_rule
),
credits_available as (
  select
    ec.participant_id,
    ec.scope,
    ec.unit,
    sum(ec.quantity) filter (
      where ec.expires_at is null or ec.expires_at > current_timestamp
    ) as credits_quantity
  from public.entitlement_credits ec
  group by ec.participant_id, ec.scope, ec.unit
),
active_overrides as (
  select distinct ao.participant_id
  from public.access_overrides ao
  where ao.allow_until > current_timestamp
)
select
  pe.participant_id,
  pe.subscription_id,
  pe.entitlement_id,
  pe.scope,
  pe.unit,
  pe.limit_type,
  pe.quantity as entitlement_limit,
  pe.reset_rule,
  pe.applies_to,
  coalesce(gu.sessions_used, 0) as sessions_used,
  coalesce(puc.minutes_used, 0) as minutes_used,
  coalesce(ca.credits_quantity, 0) as credits_available,
  case
    when ao.participant_id is not null then true
    when pe.limit_type = 'unlimited' then true
    when pe.scope = 'group' and pe.unit = 'session' then
      (coalesce(gu.sessions_used, 0) + coalesce(ca.credits_quantity, 0)) < pe.quantity
    when pe.scope = 'private' and pe.unit = 'minutes' then
      (coalesce(puc.minutes_used, 0) + coalesce(ca.credits_quantity, 0)) < pe.quantity
    else false
  end as has_availability,
  case
    when pe.limit_type = 'unlimited' then null::integer
    when pe.scope = 'group' and pe.unit = 'session' then
      greatest(
        0,
        pe.quantity
          - coalesce(gu.sessions_used, 0)
          - coalesce(ca.credits_quantity, 0)
      )
    when pe.scope = 'private' and pe.unit = 'minutes' then
      greatest(
        0,
        pe.quantity
          - coalesce(puc.minutes_used, 0)
          - coalesce(ca.credits_quantity, 0)
      )
    else null::integer
  end as remaining
from participant_entitlements pe
left join group_usage gu
  on gu.participant_id = pe.participant_id
 and gu.entitlement_id = pe.entitlement_id
left join private_usage_calc puc
  on puc.participant_id = pe.participant_id
 and puc.entitlement_id = pe.entitlement_id
left join credits_available ca
  on ca.participant_id = pe.participant_id
 and ca.scope = pe.scope
 and ca.unit = pe.unit
left join active_overrides ao on ao.participant_id = pe.participant_id;

comment on view public.participant_entitlement_status is
  'Per-entitlement usage, credits, availability. remaining matches has_availability for limited plans (credits consume the same limit as usage).';

-- =============================================================================
-- 2. apply_credits_to_account: cap new affiliate application by view_charge_net
--    (gross - affiliate already applied - write-offs), not gross alone.
-- =============================================================================

create or replace function public.apply_credits_to_account(p_account_id uuid)
returns table (
  charge_id uuid,
  credit_applied_cents integer
)
language plpgsql
set search_path = public
as $$
declare
  r record;
  v_balance integer;
  v_to_apply integer;
  v_referrer_id uuid;
  v_headroom integer;
begin
  for r in
    select
      c.id as charge_id,
      s.participant_id as billing_participant_id,
      coalesce(vcn.net_due_cents, c.amount_cents)::integer as affiliate_headroom_cents
    from public.charges c
    join public.subscriptions s on s.id = c.subscription_id
    left join public.view_charge_net vcn on vcn.charge_id = c.id
    where c.account_id = p_account_id
      and c.status = 'open'
    order by c.due_at asc
  loop
    v_referrer_id := r.billing_participant_id;
    v_balance := get_referrer_credit_balance(v_referrer_id);
    if v_balance <= 0 then
      continue;
    end if;

    v_headroom := greatest(0, r.affiliate_headroom_cents);
    v_to_apply := least(v_balance, v_headroom);

    if v_to_apply > 0 then
      insert into public.affiliate_credit_applications (charge_id, amount_cents)
      values (r.charge_id, v_to_apply);

      charge_id := r.charge_id;
      credit_applied_cents := v_to_apply;
      return next;
    end if;
  end loop;
end;
$$;

-- =============================================================================
-- 3. merge_participants: collapse duplicate active affiliate_referrals after updates
-- =============================================================================

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

  -- Keep one active row per (referrer, referred); end extras so partial unique index holds.
  update public.affiliate_referrals ar
  set
    status = 'ended',
    ended_at = coalesce(ar.ended_at, now()),
    updated_at = now()
  from (
    select id
    from (
      select
        id,
        row_number() over (
          partition by referrer_participant_id, referred_participant_id
          order by started_at asc nulls last, id asc
        ) as rn
      from public.affiliate_referrals
      where ended_at is null
        and status = 'active'
    ) ranked
    where ranked.rn > 1
  ) extras
  where ar.id = extras.id;

  update public.affiliate_credits
  set referrer_participant_id = p_canonical_participant_id
  where referrer_participant_id = p_duplicate_participant_id;

  update public.participants
  set merged_into_participant_id = p_canonical_participant_id,
      merged_at = now()
  where id = p_duplicate_participant_id;
end;
$$;

-- =============================================================================
-- 4. record_payment_refund: set payments.status = refunded when fully refunded
-- =============================================================================

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

  update public.payments p
  set status = 'refunded',
      updated_at = now()
  where p.id = p_payment_id
    and p.status = 'succeeded'
    and (
      select coalesce(sum(pr.amount_cents), 0)::integer
      from public.payment_refunds pr
      where pr.payment_id = p_payment_id
    ) >= p.amount_cents;

  return v_refund_id;
end;
$$;

-- =============================================================================
-- 5. Function privileges: no PUBLIC/anon/authenticated execute; service_role only
-- =============================================================================

revoke all on function public.record_payment_refund(uuid, integer, text, text, text) from public;
revoke all on function public.record_payment_refund(uuid, integer, text, text, text) from anon;
revoke all on function public.record_payment_refund(uuid, integer, text, text, text) from authenticated;
grant execute on function public.record_payment_refund(uuid, integer, text, text, text) to service_role;

revoke all on function public.generate_monthly_charges() from public;
revoke all on function public.generate_monthly_charges() from anon;
revoke all on function public.generate_monthly_charges() from authenticated;
grant execute on function public.generate_monthly_charges() to service_role;

revoke all on function public.can_attend_group_session(uuid, text) from public;
revoke all on function public.can_attend_group_session(uuid, text) from anon;
revoke all on function public.can_attend_group_session(uuid, text) from authenticated;
grant execute on function public.can_attend_group_session(uuid, text) to service_role;

revoke all on function public.create_affiliation(uuid, uuid, text, jsonb) from public;
revoke all on function public.create_affiliation(uuid, uuid, text, jsonb) from anon;
revoke all on function public.create_affiliation(uuid, uuid, text, jsonb) from authenticated;
grant execute on function public.create_affiliation(uuid, uuid, text, jsonb) to service_role;

revoke all on function public.record_payment_affiliate_credits(uuid) from public;
revoke all on function public.record_payment_affiliate_credits(uuid) from anon;
revoke all on function public.record_payment_affiliate_credits(uuid) from authenticated;
grant execute on function public.record_payment_affiliate_credits(uuid) to service_role;

revoke all on function public.get_referrer_credit_balance(uuid) from public;
revoke all on function public.get_referrer_credit_balance(uuid) from anon;
revoke all on function public.get_referrer_credit_balance(uuid) from authenticated;
grant execute on function public.get_referrer_credit_balance(uuid) to service_role;

revoke all on function public.apply_credits_to_account(uuid) from public;
revoke all on function public.apply_credits_to_account(uuid) from anon;
revoke all on function public.apply_credits_to_account(uuid) from authenticated;
grant execute on function public.apply_credits_to_account(uuid) to service_role;

-- merge / upgrade grants already in 0006; reinforce after merge replace
grant execute on function public.merge_participants(uuid, uuid) to service_role;
revoke all on function public.merge_participants(uuid, uuid) from public;
revoke all on function public.merge_participants(uuid, uuid) from anon;
revoke all on function public.merge_participants(uuid, uuid) from authenticated;

grant execute on function public.upgrade_subscription_prorated(uuid, uuid, date) to service_role;
revoke all on function public.upgrade_subscription_prorated(uuid, uuid, date) from public;
revoke all on function public.upgrade_subscription_prorated(uuid, uuid, date) from anon;
revoke all on function public.upgrade_subscription_prorated(uuid, uuid, date) from authenticated;
