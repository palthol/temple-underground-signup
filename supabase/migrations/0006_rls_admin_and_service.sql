-- 0006_rls_admin_and_service.sql
-- Admin and service roles: RLS enabled; only admins (and service_role) have access.
--
-- Follows Supabase RLS standards: (select fn()) for performance, TO authenticated,
-- security definer in private schema, explicit auth check.
--
-- Service role: Supabase's service_role key bypasses RLS. Use it for cron, backend,
-- and seeding the first admin. No policy needed.
--
-- Admin role: User IDs listed in app_admin get full access when using anon/authenticated.
-- Add yourself via Dashboard SQL (as service_role):
--   insert into public.app_admin (id) select id from auth.users where email = 'your@email.com';

-- =============================================================================
-- 1. Private schema and admin table (must exist before is_admin() references it)
-- =============================================================================

create schema if not exists private;

create table if not exists public.app_admin (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admin enable row level security;

-- Each user can see only their own row (to know "am I admin?"). (select auth.uid()) per Supabase perf guidance.
create policy "app_admin_select_own"
  on public.app_admin
  for select
  to authenticated
  using ( (select auth.uid()) = id );

-- Insert/update/delete: no policy for anon/authenticated; only service_role can modify.

comment on table public.app_admin is 'User IDs that have full admin access. Manage via Dashboard SQL with service_role.';

-- =============================================================================
-- 2. Admin helper (security definer not in exposed schema)
-- =============================================================================

-- Returns true if the current user is in app_admin. Used by RLS policies.
-- SECURITY DEFINER so it can read app_admin; in private schema so not exposed via API.
create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid() is not null
     and exists (select 1 from public.app_admin where id = auth.uid());
$$;

grant execute on function private.is_admin() to anon;
grant execute on function private.is_admin() to authenticated;

-- =============================================================================
-- 3. Enable RLS on all tables and add admin-only policies
-- =============================================================================
-- Uses (select private.is_admin()) so the planner caches the result per statement (Supabase RLS perf).
-- TO authenticated so the policy is not evaluated for anon (Supabase recommendation).

-- 0001
alter table public.participants enable row level security;
alter table public.waivers enable row level security;
alter table public.audit_trails enable row level security;

create policy "admin_all_participants" on public.participants for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_waivers" on public.waivers for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_audit_trails" on public.audit_trails for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );

-- 0002
alter table public.emergency_contacts enable row level security;
alter table public.waiver_medical_histories enable row level security;

create policy "admin_all_emergency_contacts" on public.emergency_contacts for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_waiver_medical_histories" on public.waiver_medical_histories for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );

-- 0004
alter table public.accounts enable row level security;
alter table public.account_members enable row level security;
alter table public.plan_definitions enable row level security;
alter table public.plan_entitlements enable row level security;
alter table public.subscriptions enable row level security;
alter table public.charges enable row level security;
alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;
alter table public.schedule_templates enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.private_usage enable row level security;
alter table public.entitlement_credits enable row level security;
alter table public.access_overrides enable row level security;

create policy "admin_all_accounts" on public.accounts for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_account_members" on public.account_members for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_plan_definitions" on public.plan_definitions for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_plan_entitlements" on public.plan_entitlements for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_subscriptions" on public.subscriptions for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_charges" on public.charges for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_payments" on public.payments for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_payment_allocations" on public.payment_allocations for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_schedule_templates" on public.schedule_templates for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_sessions" on public.sessions for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_attendance_records" on public.attendance_records for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_private_usage" on public.private_usage for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_entitlement_credits" on public.entitlement_credits for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
create policy "admin_all_access_overrides" on public.access_overrides for all to authenticated
  using ( (select private.is_admin()) ) with check ( (select private.is_admin()) );
