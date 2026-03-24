-- 0003_security_hardening.sql
-- Consolidated security and optimization hardening from:
--   0007_view_security_invoker.sql
--   0008_function_search_path.sql
--   0009_index_and_query_optimizations.sql

-- ============================================================================
-- Source: 0007_view_security_invoker.sql
-- ============================================================================
-- 0007_view_security_invoker.sql
-- Security invoker is set directly in each CREATE OR REPLACE VIEW statement.

-- ============================================================================
-- Source: 0008_function_search_path.sql
-- ============================================================================
-- 0008_function_search_path.sql
-- Fix "Function Search Path Mutable" warnings: pin search_path so functions
-- always resolve tables/views in public, not caller-controlled schemas.

alter function public.update_updated_at_column() set search_path = public;
alter function public.generate_monthly_charges() set search_path = public;
alter function public.can_attend_group_session(uuid, text) set search_path = public;

-- ============================================================================
-- Source: 0009_index_and_query_optimizations.sql
-- ============================================================================
-- 0009_index_and_query_optimizations.sql
-- Indexes and small tweaks to speed up common access patterns and views.

-- =============================================================================
-- 1. Waiver / participant lookups
-- =============================================================================
-- "All waivers for a participant" and JOINs in view_waiver_documents
create index if not exists idx_waivers_participant_id on waivers(participant_id);

-- "Latest audit per waiver" in view_waiver_documents LATERAL (ORDER BY created_at DESC LIMIT 1)
create index if not exists idx_audit_trails_waiver_created
  on audit_trails(waiver_id, created_at desc);

-- Lookups by participant and by waiver in audit
create index if not exists idx_audit_trails_participant_id on audit_trails(participant_id);

-- =============================================================================
-- 2. Billing: generate_monthly_charges() and charge checks
-- =============================================================================
-- EXISTS (subscription_id, coverage_start, status) and max(coverage_end) per subscription
create index if not exists idx_charges_subscription_coverage
  on charges(subscription_id, coverage_start) where status != 'void';

-- =============================================================================
-- 3. participant_entitlement_status view
-- =============================================================================
-- Overrides by participant and time (for "active override" lookups in view / can_attend)
create index if not exists idx_access_overrides_participant_allow_until
  on access_overrides(participant_id, allow_until desc);

-- Entitlement credits: by participant and non-expired (view filters expires_at)
create index if not exists idx_entitlement_credits_participant_expires
  on entitlement_credits(participant_id, expires_at);

-- =============================================================================
-- 4. Optional: accounts by status (dashboard "active only" filters)
-- =============================================================================
create index if not exists idx_accounts_status on accounts(status);

-- =============================================================================
-- 5. participant_entitlement_status: join from subscriptions to plan_entitlements
-- =============================================================================
create index if not exists idx_plan_entitlements_plan_definition_id
  on plan_entitlements(plan_definition_id);
