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