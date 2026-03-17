-- Seed data for local development.
-- Keep this file idempotent so `supabase db reset` is safe to run repeatedly.

begin;

insert into public.plan_definitions (
  name,
  description,
  plan_category,
  billing_cadence,
  price_cents,
  currency,
  is_active
)
select
  v.name,
  v.description,
  v.plan_category,
  v.billing_cadence,
  v.price_cents,
  v.currency,
  v.is_active
from (
  values
    (
      'Basic Group Plan',
      'Entry-level membership allowing one weekday group class per week plus Sunday open mat access.',
      'group',
      'monthly',
      10000,
      'USD',
      true
    ),
    (
      'Core Group Plan',
      'Mid-tier membership allowing two weekday group classes per week plus Sunday open mat access.',
      'group',
      'monthly',
      15000,
      'USD',
      true
    ),
    (
      'Unlimited Group Plan',
      'Full membership allowing unlimited group class attendance.',
      'group',
      'monthly',
      20000,
      'USD',
      true
    ),
    (
      'Private Basic Plan',
      'Private training membership allowing one two-hour private session per week outside public class hours, plus Sunday open mat access.',
      'private',
      'monthly',
      15000,
      'USD',
      true
    ),
    (
      'Private Core Plan',
      'Private training membership allowing two private sessions (four hours total) per week.',
      'private',
      'monthly',
      20000,
      'USD',
      true
    ),
    (
      'Jennifer Hill Unlimited Plan',
      'Custom three-month contract plan billed monthly at $135 for unlimited group class access.',
      'group',
      'contract',
      13500,
      'USD',
      true
    )
) as v(name, description, plan_category, billing_cadence, price_cents, currency, is_active)
where not exists (
  select 1
  from public.plan_definitions pd
  where pd.name = v.name
);

insert into public.plan_entitlements (
  plan_definition_id,
  scope,
  unit,
  limit_type,
  quantity,
  reset_rule,
  week_starts_on,
  applies_to
)
select
  pd.id,
  e.scope,
  e.unit,
  e.limit_type,
  e.quantity,
  e.reset_rule,
  e.week_starts_on,
  e.applies_to
from (
  values
    -- Basic Group Plan: 1 weekday group class/week + Sunday open mat
    ('Basic Group Plan', 'group', 'session', 'limited', 1, 'calendar_week', 'monday', 'weekday'),
    ('Basic Group Plan', 'group', 'session', 'unlimited', null, 'none', 'monday', 'open_mat'),

    -- Core Group Plan: 2 weekday group classes/week + Sunday open mat
    ('Core Group Plan', 'group', 'session', 'limited', 2, 'calendar_week', 'monday', 'weekday'),
    ('Core Group Plan', 'group', 'session', 'unlimited', null, 'none', 'monday', 'open_mat'),

    -- Unlimited Group Plan: unlimited group access
    ('Unlimited Group Plan', 'group', 'session', 'unlimited', null, 'none', 'monday', null),

    -- Private Basic Plan: 120 private minutes/week + Sunday open mat
    ('Private Basic Plan', 'private', 'minutes', 'limited', 120, 'calendar_week', 'monday', null),
    ('Private Basic Plan', 'group', 'session', 'unlimited', null, 'none', 'monday', 'open_mat'),

    -- Private Core Plan: 240 private minutes/week
    ('Private Core Plan', 'private', 'minutes', 'limited', 240, 'calendar_week', 'monday', null),

    -- Jennifer Hill Unlimited Plan: unlimited group access (contract billing)
    ('Jennifer Hill Unlimited Plan', 'group', 'session', 'unlimited', null, 'none', 'monday', null)
) as e(plan_name, scope, unit, limit_type, quantity, reset_rule, week_starts_on, applies_to)
join public.plan_definitions pd on pd.name = e.plan_name
where not exists (
  select 1
  from public.plan_entitlements pe
  where pe.plan_definition_id = pd.id
    and pe.scope = e.scope
    and pe.unit = e.unit
    and pe.limit_type = e.limit_type
    and coalesce(pe.quantity, -1) = coalesce(e.quantity, -1)
    and coalesce(pe.reset_rule, '') = coalesce(e.reset_rule, '')
    and pe.week_starts_on = e.week_starts_on
    and coalesce(pe.applies_to, '') = coalesce(e.applies_to, '')
);

commit;
