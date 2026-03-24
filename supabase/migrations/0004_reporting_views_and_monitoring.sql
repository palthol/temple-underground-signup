-- 0004_reporting_views_and_monitoring.sql
-- Consolidated reporting views from:
--   0003_view_waiver_documents.sql
--   0011_billing_views_and_grants.sql
--   0012_monitoring_orphan_waivers.sql

-- ============================================================================
-- Source: 0003_view_waiver_documents.sql
-- ============================================================================
CREATE OR REPLACE VIEW public.view_waiver_documents
  WITH (security_invoker = on) AS
 SELECT w.id AS waiver_id,
    w.participant_id,
    w.initials_risk_assumption,
    w.initials_release,
    w.initials_indemnification,
    w.initials_media_release,
    w.signature_image_url,
    w.signature_vector_json,
    w.signed_at_utc,
    w.review_confirm_accuracy,
    w.consent_acknowledged,
    p.full_name AS participant_full_name,
    p.date_of_birth AS participant_date_of_birth,
    p.address_line AS participant_address_line,
    p.city AS participant_city,
    p.state AS participant_state,
    p.zip AS participant_zip,
    p.home_phone AS participant_home_phone,
    p.cell_phone AS participant_cell_phone,
    p.email AS participant_email,
    mh.id AS medical_history_id,
    mh.heart_disease,
    mh.shortness_of_breath,
    mh.high_blood_pressure,
    mh.smoking,
    mh.diabetes,
    mh.family_history,
    mh.workouts,
    mh.medication,
    mh.alcohol,
    mh.last_physical,
    mh.exercise_restriction,
    mh.injuries_knees,
    mh.injuries_lower_back,
    mh.injuries_neck_shoulders,
    mh.injuries_hip_pelvis,
    mh.injuries_other_has,
    mh.injuries_other_details,
    mh.had_recent_injury,
    mh.injury_details,
    mh.physician_cleared,
    mh.clearance_notes,
    mh.created_at AS medical_history_created_at,
    mh.updated_at AS medical_history_updated_at,
    ec.id AS emergency_contact_id,
    ec.name AS emergency_contact_name,
    ec.relationship AS emergency_contact_relationship,
    ec.phone AS emergency_contact_phone,
    ec.email AS emergency_contact_email,
    ec.created_at AS emergency_contact_created_at,
    at.id AS audit_id,
    at.document_pdf_url,
    at.document_sha256,
    at.identity_snapshot,
    at.locale,
    at.content_version,
    at.created_at AS audit_created_at
   FROM waivers w
     LEFT JOIN participants p ON p.id = w.participant_id
     LEFT JOIN LATERAL ( SELECT mh2.id,
            mh2.waiver_id,
            mh2.heart_disease,
            mh2.shortness_of_breath,
            mh2.high_blood_pressure,
            mh2.smoking,
            mh2.diabetes,
            mh2.family_history,
            mh2.workouts,
            mh2.medication,
            mh2.alcohol,
            mh2.last_physical,
            mh2.exercise_restriction,
            mh2.injuries_knees,
            mh2.injuries_lower_back,
            mh2.injuries_neck_shoulders,
            mh2.injuries_hip_pelvis,
            mh2.injuries_other_has,
            mh2.injuries_other_details,
            mh2.had_recent_injury,
            mh2.injury_details,
            mh2.physician_cleared,
            mh2.clearance_notes,
            mh2.created_at,
            mh2.updated_at
           FROM waiver_medical_histories mh2
          WHERE mh2.waiver_id = w.id
          ORDER BY (COALESCE(mh2.created_at, mh2.updated_at)) DESC NULLS LAST
         LIMIT 1) mh ON true
     LEFT JOIN LATERAL ( SELECT ec2.id,
            ec2.waiver_id,
            ec2.participant_id,
            ec2.name,
            ec2.relationship,
            ec2.phone,
            ec2.email,
            ec2.created_at
           FROM emergency_contacts ec2
          WHERE ec2.waiver_id = w.id
          ORDER BY (COALESCE(ec2.created_at, '1970-01-01 00:00:00+00'::timestamp with time zone)) DESC
         LIMIT 1) ec ON true
     LEFT JOIN LATERAL ( SELECT at2.id,
            at2.participant_id,
            at2.waiver_id,
            at2.document_pdf_url,
            at2.document_sha256,
            at2.identity_snapshot,
            at2.locale,
            at2.content_version,
            at2.created_at
           FROM audit_trails at2
          WHERE at2.waiver_id = w.id
          ORDER BY (COALESCE(at2.created_at, '1970-01-01 00:00:00+00'::timestamp with time zone)) DESC
         LIMIT 1) at ON true;

-- ============================================================================
-- Source: 0011_billing_views_and_grants.sql
-- ============================================================================
-- 0011_billing_views_and_grants.sql
-- Purpose:
--   1) Member billing board view (sheet-like)
--   2) Reminder queue view (overdue + due soon)
--   3) Explicit grants for API roles
--
-- Supabase conventions used:
--   - create or replace view
--   - with (security_invoker = on) so RLS of querying user applies
--   - explicit revoke/grant
--   - idempotent / migration-safe structure

-- ============================================================================
-- 1) Billing board view
-- ============================================================================

create or replace view public.view_member_payment_board
with (security_invoker = on) as
with active_subscriptions as (
  select
    s.id as subscription_id,
    s.account_id,
    s.participant_id,
    s.plan_definition_id,
    pd.price_cents as base_price_cents
  from public.subscriptions s
  join public.plan_definitions pd on pd.id = s.plan_definition_id
  where s.status = 'active'
    and (s.ends_at is null or s.ends_at >= current_date)
),
latest_charge as (
  select distinct on (asub.participant_id)
    asub.participant_id,
    asub.account_id,
    asub.subscription_id,
    asub.base_price_cents,
    c.id as charge_id,
    c.amount_cents as charge_amount_cents,
    c.due_at,
    c.status as charge_status,
    c.created_at as charge_created_at
  from active_subscriptions asub
  left join public.charges c
    on c.subscription_id = asub.subscription_id
   and c.status <> 'void'
  order by
    asub.participant_id,
    c.due_at desc nulls last,
    c.created_at desc nulls last
),
allocations as (
  select
    pa.charge_id,
    coalesce(sum(pa.amount_cents), 0)::integer as allocated_cents
  from public.payment_allocations pa
  group by pa.charge_id
),
last_payment as (
  select
    pa.charge_id,
    max(p.paid_at)::date as paid_date
  from public.payment_allocations pa
  join public.payments p on p.id = pa.payment_id
  where p.status = 'succeeded'
  group by pa.charge_id
)
select
  p.id as participant_id,
  lc.account_id,
  p.full_name as name,
  (lc.base_price_cents / 100.0)::numeric(10,2) as base_price,
  (
    coalesce(vcn.net_due_cents, lc.charge_amount_cents, lc.base_price_cents) / 100.0
  )::numeric(10,2) as actual_price,
  (
    lc.charge_id is not null
    and (
      lc.charge_status = 'paid'
      or coalesce(a.allocated_cents, 0) >= coalesce(vcn.net_due_cents, lc.charge_amount_cents, lc.base_price_cents)
    )
  ) as paid,
  lp.paid_date,
  lc.due_at as next_due_date,
  case
    when lc.charge_id is null then null::integer
    when (
      lc.charge_status = 'paid'
      or coalesce(a.allocated_cents, 0) >= coalesce(vcn.net_due_cents, lc.charge_amount_cents, lc.base_price_cents)
    ) then 0
    else greatest((current_date - lc.due_at), 0)::integer
  end as days_late,
  lc.charge_id,
  coalesce(vcn.net_due_cents, lc.charge_amount_cents, lc.base_price_cents)::integer as expected_due_cents,
  coalesce(a.allocated_cents, 0)::integer as allocated_cents
from latest_charge lc
join public.participants p on p.id = lc.participant_id
left join allocations a on a.charge_id = lc.charge_id
left join last_payment lp on lp.charge_id = lc.charge_id
left join public.view_charge_net vcn on vcn.charge_id = lc.charge_id
order by
  paid asc,
  days_late desc nulls last,
  name;

comment on view public.view_member_payment_board is
'Member billing board: name, base/actual price, paid state, paid date, due date, and lateness metrics.';

-- ============================================================================
-- 2) Reminder queue view
--    - overdue: due date already passed and not fully paid
--    - due_soon: due within next 3 days and not fully paid
-- ============================================================================

create or replace view public.view_member_payment_reminders
with (security_invoker = on) as
select
  b.participant_id,
  b.account_id,
  b.name,
  b.base_price,
  b.actual_price,
  b.paid,
  b.paid_date,
  b.next_due_date,
  b.days_late,
  case
    when b.paid = true then 'ok'
    when b.next_due_date is null then 'no_charge'
    when b.next_due_date < current_date then 'overdue'
    when b.next_due_date <= current_date + 3 then 'due_soon'
    else 'ok'
  end as reminder_bucket
from public.view_member_payment_board b
where b.paid = false
  and b.next_due_date is not null
  and b.next_due_date <= current_date + 3
order by
  case
    when b.next_due_date < current_date then 1
    when b.next_due_date <= current_date + 3 then 2
    else 3
  end,
  b.next_due_date,
  b.name;

comment on view public.view_member_payment_reminders is
'Queue of members needing reminders (overdue and due soon) for daily digest automation.';

-- ============================================================================
-- 3) Grants
-- ============================================================================

revoke all on public.view_member_payment_board from public;
revoke all on public.view_member_payment_reminders from public;

grant select on public.view_member_payment_board to authenticated;
grant select on public.view_member_payment_reminders to authenticated;

-- Optional:
-- grant select on public.view_member_payment_board to anon;
-- grant select on public.view_member_payment_reminders to anon;

-- ============================================================================
-- Source: 0012_monitoring_orphan_waivers.sql
-- ============================================================================
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
