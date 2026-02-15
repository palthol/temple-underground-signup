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
  plan_price integer;
  billing_cadence text;
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
        select max(coverage_end)
        from charges
        where subscription_id = s.id
          and status != 'void'
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
      from charges
      where subscription_id = sub_record.subscription_id
        and coverage_start = next_coverage_start
        and status != 'void'
    ) then
      -- Only generate if we're at or past the due date
      if next_due_at <= current_date then
        -- Insert the charge
        insert into charges (
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
          id,
          account_id,
          subscription_id,
          amount_cents,
          coverage_start,
          coverage_end,
          due_at
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
            and extract(dow from s.starts_at) between 1 and 7
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



