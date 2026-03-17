-- 0012_monitoring_orphan_waivers.sql
-- Monitoring views for waiver participants missing billing linkage.

create or replace view public.view_orphan_waivers
with (security_invoker = on) as
select
  w.participant_id,
  p.full_name,
  p.email,
  min(w.signed_at_utc) as first_waiver_at,
  max(w.signed_at_utc) as latest_waiver_at,
  count(*)::integer as waiver_count
from public.waivers w
left join public.account_members am on am.participant_id = w.participant_id
left join public.participants p on p.id = w.participant_id
where am.id is null
group by w.participant_id, p.full_name, p.email;

comment on view public.view_orphan_waivers is
'Participants with waiver submissions but no account_members billing linkage.';

create or replace view public.view_orphan_waiver_summary
with (security_invoker = on) as
select
  count(*)::integer as orphan_waiver_participant_count
from public.view_orphan_waivers;

comment on view public.view_orphan_waiver_summary is
'Single-row count of participants with waivers but no account linkage.';

revoke all on public.view_orphan_waivers from public;
revoke all on public.view_orphan_waiver_summary from public;

grant select on public.view_orphan_waivers to authenticated;
grant select on public.view_orphan_waiver_summary to authenticated;

