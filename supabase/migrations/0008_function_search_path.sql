-- 0008_function_search_path.sql
-- Fix "Function Search Path Mutable" warnings: pin search_path so functions
-- always resolve tables/views in public, not caller-controlled schemas.

alter function public.update_updated_at_column() set search_path = public;
alter function public.generate_monthly_charges() set search_path = public;
alter function public.can_attend_group_session(uuid, text) set search_path = public;
