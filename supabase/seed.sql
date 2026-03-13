-- Seed data for local development.
-- Keep this file idempotent so `supabase db reset` is safe to run repeatedly.

begin;

-- Example:
-- insert into public.plan_definitions (name, plan_category, billing_cadence, price_cents)
-- values ('Monthly Group', 'group', 'monthly', 15000)
-- on conflict do nothing;

commit;
