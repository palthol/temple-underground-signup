-- 0002_business_logic_and_affiliations.sql
-- Consolidated business logic from:
--   0005_billing_functions.sql
--   0010_affiliations_referrals_credits.sql

-- ============================================================================
-- Source: 0005_billing_functions.sql
-- ============================================================================
-- 0005_billing_functions.sql
-- Functions for charge generation and entitlement checking

-- ============================================================================
-- CHARGE GENERATION FUNCTION
-- ============================================================================

-- Function to generate charges for active subscriptions
-- Can be called manually or scheduled via pg_cron
create or replace function generate_monthly_charges()
returns table (
  charge_id uuid,
  account_id uuid,
  subscription_id uuid,
  amount_cents integer,
  coverage_start date,
  coverage_end date,
  due_at date
) as $$
declare
  sub_record record;
  charge_record record;
  next_coverage_start date;
  next_coverage_end date;
  next_due_at date;
begin
  -- Loop through active subscriptions
  for sub_record in
    select
      s.id as subscription_id,
      s.account_id,
      s.plan_definition_id,
      s.starts_at,
      s.ends_at,
      pd.price_cents,
      pd.billing_cadence,
      -- Find the last charge for this subscription to determine next period
      (
        select max(ch.coverage_end)
        from charges ch
        where ch.subscription_id = s.id
          and ch.status != 'void'
      ) as last_coverage_end
    from subscriptions s
    join plan_definitions pd on pd.id = s.plan_definition_id
    where s.status = 'active'
      and pd.billing_cadence = 'monthly' -- Only auto-generate for monthly subscriptions
      and (s.ends_at is null or s.ends_at > current_date)
  loop
    -- Skip if subscription has ended
    if sub_record.ends_at is not null and sub_record.ends_at < current_date then
      continue;
    end if;

    -- Determine next billing period
    if sub_record.last_coverage_end is null then
      -- First charge: use subscription starts_at as anchor
      next_coverage_start := sub_record.starts_at;
    else
      -- Subsequent charges: start day after last coverage ended
      next_coverage_start := sub_record.last_coverage_end + interval '1 day';
    end if;

    -- Calculate coverage end (month-to-month from anchor day)
    next_coverage_end := (
      date_trunc('month', next_coverage_start) + interval '1 month' - interval '1 day'
    )::date;

    -- Adjust if subscription ends before coverage period
    if sub_record.ends_at is not null and sub_record.ends_at < next_coverage_end then
      next_coverage_end := sub_record.ends_at;
    end if;

    -- Due date is the same as coverage start (day-of-month anchor)
    next_due_at := next_coverage_start;

    -- Check if charge already exists for this period
    if not exists (
      select 1
      from charges chx
      where chx.subscription_id = sub_record.subscription_id
        and chx.coverage_start = next_coverage_start
        and chx.status != 'void'
    ) then
      -- Only generate if we're at or past the due date
      if next_due_at <= current_date then
        -- Insert the charge
        insert into public.charges as ch_ins (
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
          sub_record.account_id,
          sub_record.subscription_id,
          sub_record.price_cents,
          'USD',
          next_coverage_start,
          next_coverage_end,
          next_due_at,
          'open',
          format('Auto-generated for subscription period %s to %s',
                 next_coverage_start, next_coverage_end)
        )
        returning
          ch_ins.id,
          ch_ins.account_id,
          ch_ins.subscription_id,
          ch_ins.amount_cents,
          ch_ins.coverage_start,
          ch_ins.coverage_end,
          ch_ins.due_at
        into charge_record;

        -- Return the created charge
        charge_id := charge_record.id;
        account_id := charge_record.account_id;
        subscription_id := charge_record.subscription_id;
        amount_cents := charge_record.amount_cents;
        coverage_start := charge_record.coverage_start;
        coverage_end := charge_record.coverage_end;
        due_at := charge_record.due_at;

        return next;
      end if;
    end if;
  end loop;

  return;
end;
$$ language plpgsql set search_path = public;

-- Grant execute permission (adjust role as needed)
-- grant execute on function generate_monthly_charges() to authenticated;

-- ============================================================================
-- ENTITLEMENT USAGE VIEW
-- ============================================================================

-- View to check participant entitlement usage and availability
-- This is read-only and won't conflict with any writes.
-- security_invoker = on so RLS of the querying user applies (not the view definer).
create or replace view participant_entitlement_status
  with (security_invoker = on) as
with active_subscriptions as (
  select
    s.id as subscription_id,
    s.participant_id,
    s.plan_definition_id,
    s.starts_at,
    s.ends_at,
    s.status as subscription_status
  from subscriptions s
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
  join plan_entitlements pe on pe.plan_definition_id = asub.plan_definition_id
),
-- Calculate group session usage (from attendance_records)
group_usage as (
  select
    pe.participant_id,
    pe.entitlement_id,
    pe.reset_rule,
    -- Calculate usage for current period based on reset_rule
    case
      when pe.reset_rule = 'calendar_week' then
        -- Count sessions in current week (Monday to Sunday)
        count(*) filter (
          where ar.status = 'present'
            and date_trunc('week', s.starts_at) = date_trunc('week', current_date)
        )
      else
        -- No reset: count all time
        count(*) filter (where ar.status = 'present')
    end as sessions_used
  from participant_entitlements pe
  left join attendance_records ar on ar.participant_id = pe.participant_id
  left join sessions s on s.id = ar.session_id
  where pe.scope = 'group' and pe.unit = 'session'
  group by pe.participant_id, pe.entitlement_id, pe.reset_rule
),
-- Calculate private minutes usage
private_usage_calc as (
  select
    pe.participant_id,
    pe.entitlement_id,
    pe.reset_rule,
    case
      when pe.reset_rule = 'calendar_week' then
        -- Sum minutes in current week (Monday to Sunday)
        coalesce(sum(pu.minutes_used) filter (
          where date_trunc('week', pu.occurred_at) = date_trunc('week', current_date)
        ), 0)
      else
        -- No reset: sum all time
        coalesce(sum(pu.minutes_used), 0)
    end as minutes_used
  from participant_entitlements pe
  left join private_usage pu on pu.participant_id = pe.participant_id
  where pe.scope = 'private' and pe.unit = 'minutes'
  group by pe.participant_id, pe.entitlement_id, pe.reset_rule
),
-- Calculate entitlement credits (bonus credits)
credits_available as (
  select
    ec.participant_id,
    ec.scope,
    ec.unit,
    sum(ec.quantity) filter (
      where ec.expires_at is null or ec.expires_at > current_timestamp
    ) as credits_quantity
  from entitlement_credits ec
  group by ec.participant_id, ec.scope, ec.unit
),
-- Check for active access overrides
active_overrides as (
  select distinct
    ao.participant_id
  from access_overrides ao
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
  -- Usage
  coalesce(gu.sessions_used, 0) as sessions_used,
  coalesce(puc.minutes_used, 0) as minutes_used,
  -- Credits
  coalesce(ca.credits_quantity, 0) as credits_available,
  -- Availability calculation
  case
    when ao.participant_id is not null then true -- Override grants access
    when pe.limit_type = 'unlimited' then true -- Unlimited always available
    when pe.scope = 'group' and pe.unit = 'session' then
      (coalesce(gu.sessions_used, 0) + coalesce(ca.credits_quantity, 0)) < pe.quantity
    when pe.scope = 'private' and pe.unit = 'minutes' then
      (coalesce(puc.minutes_used, 0) + coalesce(ca.credits_quantity, 0)) < pe.quantity
    else false
  end as has_availability,
  -- Remaining
  case
    when pe.limit_type = 'unlimited' then null::integer
    when pe.scope = 'group' and pe.unit = 'session' then
      greatest(0, pe.quantity - coalesce(gu.sessions_used, 0) + coalesce(ca.credits_quantity, 0))
    when pe.scope = 'private' and pe.unit = 'minutes' then
      greatest(0, pe.quantity - coalesce(puc.minutes_used, 0) + coalesce(ca.credits_quantity, 0))
    else null::integer
  end as remaining
from participant_entitlements pe
left join group_usage gu on gu.participant_id = pe.participant_id
  and gu.entitlement_id = pe.entitlement_id
left join private_usage_calc puc on puc.participant_id = pe.participant_id
  and puc.entitlement_id = pe.entitlement_id
left join credits_available ca on ca.participant_id = pe.participant_id
  and ca.scope = pe.scope
  and ca.unit = pe.unit
left join active_overrides ao on ao.participant_id = pe.participant_id;

-- Grant select permission (adjust role as needed)
-- grant select on participant_entitlement_status to authenticated;

-- ============================================================================
-- HELPER FUNCTION: Check if participant can attend session
-- ============================================================================

-- Simple function to check if a participant can attend a group session
create or replace function can_attend_group_session(
  p_participant_id uuid,
  p_session_label text default null
)
returns boolean as $$
declare
  has_access boolean;
  override_active boolean;
begin
  -- Check for active override first (highest priority)
  select exists(
    select 1
    from access_overrides
    where participant_id = p_participant_id
      and allow_until > current_timestamp
  ) into override_active;

  if override_active then
    return true;
  end if;

  -- Check entitlements
  select exists(
    select 1
    from participant_entitlement_status
    where participant_id = p_participant_id
      and scope = 'group'
      and unit = 'session'
      and has_availability = true
      and (p_session_label is null or applies_to is null or applies_to = p_session_label)
  ) into has_access;

  return coalesce(has_access, false);
end;
$$ language plpgsql stable set search_path = public;

-- Grant execute permission
-- grant execute on function can_attend_group_session(uuid, text) to authenticated;

-- ============================================================================
-- Source: 0010_affiliations_referrals_credits.sql
-- ============================================================================
-- 0010_affiliations_referrals_credits.sql
-- Affiliations: family relationships, affiliate referrals, and credit system.
-- Integrates with existing accounts, participants, subscriptions, charges, payments.

-- =============================================================================
-- 1. Participant relationships (family: parent/child, sibling, spouse)
-- =============================================================================

create table if not exists participant_relationships (
  id uuid primary key default gen_random_uuid(),
  participant_a_id uuid not null references participants(id) on delete cascade,
  participant_b_id uuid not null references participants(id) on delete cascade,
  relationship_type text not null,
  role_a text,
  role_b text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_participant_relationship_no_self check (participant_a_id != participant_b_id),
  constraint check_relationship_type check (
    relationship_type in ('parent_child', 'sibling', 'spouse', 'other')
  ),
  constraint unique_participant_relationship unique (participant_a_id, participant_b_id, relationship_type)
);

create index if not exists idx_participant_relationships_a on participant_relationships(participant_a_id);
create index if not exists idx_participant_relationships_b on participant_relationships(participant_b_id);

-- =============================================================================
-- 2. Affiliate referrals (referrer -> referred)
-- =============================================================================

create table if not exists affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_participant_id uuid not null references participants(id) on delete cascade,
  referred_participant_id uuid not null references participants(id) on delete cascade,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  rules_version text default 'v1',
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_affiliate_no_self check (referrer_participant_id != referred_participant_id),
  constraint check_affiliate_status check (status in ('active', 'ended', 'cancelled')),
  constraint check_affiliate_dates check (ended_at is null or ended_at >= started_at)
);

-- Prevent duplicate active referral (same referrer+referred without end date)
create unique index if not exists idx_affiliate_referrals_active_unique
  on affiliate_referrals(referrer_participant_id, referred_participant_id)
  where ended_at is null and status = 'active';

create index if not exists idx_affiliate_referrals_referrer on affiliate_referrals(referrer_participant_id);
create index if not exists idx_affiliate_referrals_referred on affiliate_referrals(referred_participant_id);
create index if not exists idx_affiliate_referrals_status on affiliate_referrals(status);

-- =============================================================================
-- 3. Affiliate credits (earned from referred participant's payments)
-- =============================================================================

create table if not exists affiliate_credits (
  id uuid primary key default gen_random_uuid(),
  referrer_participant_id uuid not null references participants(id) on delete cascade,
  referral_id uuid not null references affiliate_referrals(id) on delete restrict,
  source_payment_id uuid not null references payments(id) on delete restrict,
  source_charge_id uuid references charges(id) on delete set null,
  amount_cents integer not null,
  currency text not null default 'USD',
  earned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint check_affiliate_credit_amount check (amount_cents > 0)
);

create index if not exists idx_affiliate_credits_referrer on affiliate_credits(referrer_participant_id);
create index if not exists idx_affiliate_credits_referral on affiliate_credits(referral_id);
create index if not exists idx_affiliate_credits_earned_at on affiliate_credits(earned_at);

-- =============================================================================
-- 4. Affiliate credit applications (credits applied to referrer's charges)
-- =============================================================================

create table if not exists affiliate_credit_applications (
  id uuid primary key default gen_random_uuid(),
  charge_id uuid not null references charges(id) on delete cascade,
  amount_cents integer not null,
  applied_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint check_credit_application_amount check (amount_cents > 0)
);

create index if not exists idx_affiliate_credit_applications_charge on affiliate_credit_applications(charge_id);

-- =============================================================================
-- 5. Triggers for updated_at
-- =============================================================================

create trigger update_participant_relationships_updated_at
  before update on participant_relationships
  for each row execute function update_updated_at_column();

create trigger update_affiliate_referrals_updated_at
  before update on affiliate_referrals
  for each row execute function update_updated_at_column();

-- =============================================================================
-- 6. RLS (follow existing admin-only pattern)
-- =============================================================================

alter table public.participant_relationships enable row level security;
alter table public.affiliate_referrals enable row level security;
alter table public.affiliate_credits enable row level security;
alter table public.affiliate_credit_applications enable row level security;

create policy "admin_all_participant_relationships" on public.participant_relationships
  for all to authenticated using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_affiliate_referrals" on public.affiliate_referrals
  for all to authenticated using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_affiliate_credits" on public.affiliate_credits
  for all to authenticated using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_affiliate_credit_applications" on public.affiliate_credit_applications
  for all to authenticated using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );

-- =============================================================================
-- 7. Helper view: charge net amount (gross - credits applied)
-- =============================================================================

create or replace view public.view_charge_net
  with (security_invoker = on) as
select
  c.id as charge_id,
  c.account_id,
  c.subscription_id,
  c.amount_cents as gross_cents,
  coalesce(sum(aca.amount_cents), 0)::integer as credit_applied_cents,
  (c.amount_cents - coalesce(sum(aca.amount_cents), 0))::integer as net_due_cents,
  c.status,
  c.due_at
from charges c
left join affiliate_credit_applications aca on aca.charge_id = c.id
group by c.id, c.account_id, c.subscription_id, c.amount_cents, c.status, c.due_at;

-- =============================================================================
-- 8. Functions
-- =============================================================================

-- create_affiliation: create family relationship or affiliate referral
create or replace function public.create_affiliation(
  p_participant_a_id uuid,
  p_participant_b_id uuid,
  p_relationship_type text,
  p_metadata jsonb default null
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_participant_a_id = p_participant_b_id then
    raise exception 'Cannot create relationship: participant cannot relate to self';
  end if;

  if p_relationship_type = 'affiliate' then
    insert into affiliate_referrals (
      referrer_participant_id,
      referred_participant_id,
      status,
      metadata
    )
    values (
      p_participant_a_id,
      p_participant_b_id,
      'active',
      p_metadata
    )
    returning id into v_id;
    return v_id;
  else
    insert into participant_relationships (
      participant_a_id,
      participant_b_id,
      relationship_type,
      role_a,
      role_b
    )
    values (
      p_participant_a_id,
      p_participant_b_id,
      p_relationship_type,
      coalesce((p_metadata->>'role_a'), 'member'),
      (p_metadata->>'role_b')
    )
    on conflict (participant_a_id, participant_b_id, relationship_type) do nothing
    returning id into v_id;
    return coalesce(v_id, (
      select id from participant_relationships
      where participant_a_id = p_participant_a_id
        and participant_b_id = p_participant_b_id
        and relationship_type = p_relationship_type
      limit 1
    ));
  end if;
end;
$$;

-- record_payment_affiliate_credits: call after payment is allocated to charges
-- For each allocation: if charge is for a monthly subscription of a referred participant,
-- create 10% affiliate credit for the referrer.
create or replace function public.record_payment_affiliate_credits(
  p_payment_id uuid
)
returns integer
language plpgsql
set search_path = public
as $$
declare
  r record;
  v_credit_cents integer;
  v_referral_id uuid;
  v_credits_created integer := 0;
begin
  for r in
    select
      pa.payment_id,
      pa.charge_id,
      pa.amount_cents,
      c.subscription_id,
      s.participant_id as referred_participant_id,
      s.plan_definition_id,
      pd.billing_cadence
    from payment_allocations pa
    join charges c on c.id = pa.charge_id
    left join subscriptions s on s.id = c.subscription_id
    left join plan_definitions pd on pd.id = s.plan_definition_id
    where pa.payment_id = p_payment_id
      and c.subscription_id is not null
      and pd.billing_cadence = 'monthly'
  loop
    -- Find active referral for this participant
    select ar.id into v_referral_id
    from affiliate_referrals ar
    where ar.referred_participant_id = r.referred_participant_id
      and ar.status = 'active'
      and ar.ended_at is null
    limit 1;

    if v_referral_id is not null then
      v_credit_cents := greatest(1, (r.amount_cents * 10) / 100);

      -- Avoid duplicate credit for same payment+charge
      if not exists (
        select 1 from affiliate_credits
        where source_payment_id = p_payment_id
          and source_charge_id = r.charge_id
      ) then
        insert into affiliate_credits (
          referrer_participant_id,
          referral_id,
          source_payment_id,
          source_charge_id,
          amount_cents
        )
        select
          ar.referrer_participant_id,
          v_referral_id,
          p_payment_id,
          r.charge_id,
          v_credit_cents
        from affiliate_referrals ar
        where ar.id = v_referral_id;

        v_credits_created := v_credits_created + 1;
      end if;
    end if;
  end loop;

  return v_credits_created;
end;
$$;

-- get_referrer_credit_balance: available credit for a referrer participant
create or replace function public.get_referrer_credit_balance(p_referrer_participant_id uuid)
returns integer
language sql
stable
set search_path = public
as $$
  select coalesce(
    (select sum(amount_cents) from affiliate_credits where referrer_participant_id = p_referrer_participant_id),
    0
  ) - coalesce(
    (select sum(aca.amount_cents)
     from affiliate_credit_applications aca
     join charges c on c.id = aca.charge_id
     join subscriptions s on s.id = c.subscription_id
     where s.participant_id = p_referrer_participant_id),
    0
  )::integer;
$$;

-- apply_credits_to_account: apply available referrer credits to next open charge(s)
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
begin
  for r in
    select c.id as charge_id, c.amount_cents, c.subscription_id, s.participant_id
    from charges c
    join subscriptions s on s.id = c.subscription_id
    where c.account_id = p_account_id
      and c.status = 'open'
    order by c.due_at asc
  loop
    v_referrer_id := r.participant_id;
    v_balance := get_referrer_credit_balance(v_referrer_id);
    if v_balance <= 0 then
      continue;
    end if;

    v_to_apply := least(
      v_balance,
      r.amount_cents - coalesce(
        (select sum(amount_cents) from affiliate_credit_applications where charge_id = r.charge_id),
        0
      )
    );

    if v_to_apply > 0 then
      insert into affiliate_credit_applications (charge_id, amount_cents)
      values (r.charge_id, v_to_apply);

      charge_id := r.charge_id;
      credit_applied_cents := v_to_apply;
      return next;
    end if;
  end loop;
end;
$$;
