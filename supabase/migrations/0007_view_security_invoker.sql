-- 0007_view_security_invoker.sql
-- Set views to run as the querying user (security invoker) so RLS applies correctly.
-- Fixes security finding: views must not run with definer rights.

alter view if exists public.view_waiver_documents set (security_invoker = on);
alter view if exists public.participant_entitlement_status set (security_invoker = on);
