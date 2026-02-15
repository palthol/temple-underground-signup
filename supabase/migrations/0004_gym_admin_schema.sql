-- 0004_gym_admin_schema.sql
-- V1 Minimum Viable Schema: accounts, plans, subscriptions, billing, and attendance tracking

-- Note: pgcrypto extension is created in 0001_init.sql

-- 002_core_tables.sql

-- accounts: payer/billing entity covering one or more participants
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'active',
  primary_contact_name text,
  primary_contact_phone text,
  primary_contact_email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_account_status check (status in ('active', 'inactive'))
);

-- account_members: join table linking participants to accounts
create table if not exists account_members (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_account_member_role check (role in ('member', 'payer', 'guardian')),
  constraint unique_account_participant unique (account_id, participant_id)
);

-- plan_definitions: plan catalog entries (pricing + billing metadata)
create table if not exists plan_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  plan_category text not null,
  billing_cadence text not null,
  price_cents integer not null,
  currency text not null default 'USD',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_plan_category check (plan_category in ('group', 'private', 'hybrid')),
  constraint check_billing_cadence check (billing_cadence in ('per_session', 'monthly', 'contract', 'custom')),
  constraint check_price_cents check (price_cents >= 0)
);

-- plan_entitlements: defines what each plan grants; supports multiple entitlements per plan
create table if not exists plan_entitlements (
  id uuid primary key default gen_random_uuid(),
  plan_definition_id uuid not null references plan_definitions(id) on delete cascade,
  scope text not null,
  unit text not null,
  limit_type text not null,
  quantity integer,
  reset_rule text,
  week_starts_on text not null default 'monday',
  applies_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_plan_entitlement_scope check (scope in ('group', 'private')),
  constraint check_plan_entitlement_unit check (unit in ('session', 'minutes')),
  constraint check_plan_entitlement_limit_type check (limit_type in ('limited', 'unlimited')),
  constraint check_plan_entitlement_reset_rule check (reset_rule is null or reset_rule in ('calendar_week', 'none')),
  constraint check_plan_entitlement_week_starts_on check (week_starts_on = 'monday'),
  constraint check_plan_entitlement_quantity_logic check (
    (limit_type = 'limited' and quantity is not null and quantity > 0)
    or
    (limit_type = 'unlimited' and quantity is null)
  ),
  constraint check_plan_entitlement_scope_unit check (
    (scope = 'group' and unit = 'session')
    or
    (scope = 'private' and unit = 'minutes')
  )
);

-- subscriptions: account enrollment for a participant; references a plan definition
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  plan_definition_id uuid not null references plan_definitions(id) on delete restrict,
  status text not null default 'active',
  starts_at date not null,
  ends_at date,
  cancelled_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_subscription_status check (status in ('active', 'paused', 'cancelled', 'expired')),
  constraint check_subscription_dates check (ends_at is null or ends_at >= starts_at)
);

-- charges: ledger of amounts owed for a coverage period
create table if not exists charges (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  amount_cents integer not null,
  currency text not null default 'USD',
  coverage_start date not null,
  coverage_end date not null,
  due_at date not null,
  status text not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_charge_amount_cents check (amount_cents >= 0),
  constraint check_charge_status check (status in ('open', 'paid', 'void')),
  constraint check_charge_coverage_dates check (coverage_end >= coverage_start)
);

-- payments: ledger of money received (collected revenue)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  amount_cents integer not null,
  currency text not null default 'USD',
  paid_at timestamptz not null default now(),
  method text not null,
  source text not null default 'manual',
  status text not null default 'succeeded',
  reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_payment_amount_cents check (amount_cents > 0),
  constraint check_payment_method check (method in ('cash', 'card', 'cashapp', 'venmo', 'paypal', 'zelle', 'other')),
  constraint check_payment_source check (source in ('manual', 'provider')),
  constraint check_payment_status check (status in ('pending', 'succeeded', 'failed', 'refunded'))
);

-- payment_allocations: maps payments to charges
create table if not exists payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id) on delete cascade,
  charge_id uuid not null references charges(id) on delete cascade,
  amount_cents integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_allocation_amount_cents check (amount_cents > 0),
  constraint unique_payment_charge unique (payment_id, charge_id)
);

-- schedule_templates: recurring schedule patterns
create table if not exists schedule_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  day_of_week integer not null,
  start_time time not null,
  duration_minutes integer not null,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_day_of_week check (day_of_week between 1 and 7),
  constraint check_duration_minutes check (duration_minutes > 0)
);

-- sessions: scheduled occurrences (blended training sessions)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  schedule_template_id uuid references schedule_templates(id) on delete set null,
  session_label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_session_times check (ends_at > starts_at)
);

-- attendance_records: attendance tracking; group entitlement consumption derived from present attendance
create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  status text not null default 'present',
  recorded_at timestamptz not null default now(),
  recorded_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_attendance_status check (status in ('present', 'no_show', 'cancelled')),
  constraint unique_session_participant unique (session_id, participant_id)
);

-- private_usage: tracks private minutes consumed
create table if not exists private_usage (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  minutes_used integer not null,
  notes text,
  recorded_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_minutes_used check (minutes_used > 0)
);

-- entitlement_credits: tracks complimentary credits
create table if not exists entitlement_credits (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  scope text not null default 'private',
  unit text not null default 'minutes',
  quantity integer not null,
  reason text not null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_entitlement_credit_scope check (scope in ('private', 'group')),
  constraint check_entitlement_credit_unit check (unit in ('minutes', 'session')),
  constraint check_entitlement_credit_quantity check (quantity > 0)
);

-- access_overrides: explicit, auditable "allow training" override
create table if not exists access_overrides (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  allow_until timestamptz not null,
  reason text not null,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 003_indexes.sql

create index if not exists idx_subscriptions_account_id on subscriptions(account_id);
create index if not exists idx_subscriptions_participant_id on subscriptions(participant_id);
create index if not exists idx_subscriptions_plan_definition_id on subscriptions(plan_definition_id);
create index if not exists idx_subscriptions_status on subscriptions(status);

create index if not exists idx_charges_account_id on charges(account_id);
create index if not exists idx_charges_subscription_id on charges(subscription_id);
create index if not exists idx_charges_due_at on charges(due_at);
create index if not exists idx_charges_status on charges(status);

create index if not exists idx_payments_account_id on payments(account_id);
create index if not exists idx_payments_paid_at on payments(paid_at);
create index if not exists idx_payments_status on payments(status);

create index if not exists idx_payment_allocations_payment_id on payment_allocations(payment_id);
create index if not exists idx_payment_allocations_charge_id on payment_allocations(charge_id);

create index if not exists idx_sessions_starts_at on sessions(starts_at);
create index if not exists idx_sessions_schedule_template_id on sessions(schedule_template_id);

create index if not exists idx_attendance_records_participant_id on attendance_records(participant_id);
create index if not exists idx_attendance_records_session_id on attendance_records(session_id);

create index if not exists idx_private_usage_participant_id on private_usage(participant_id);
create index if not exists idx_private_usage_occurred_at on private_usage(occurred_at);

create index if not exists idx_access_overrides_participant_id on access_overrides(participant_id);
create index if not exists idx_access_overrides_allow_until on access_overrides(allow_until);

-- 004_triggers.sql

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger update_accounts_updated_at
  before update on accounts
  for each row
  execute function update_updated_at_column();

create trigger update_account_members_updated_at
  before update on account_members
  for each row
  execute function update_updated_at_column();

create trigger update_plan_definitions_updated_at
  before update on plan_definitions
  for each row
  execute function update_updated_at_column();

create trigger update_plan_entitlements_updated_at
  before update on plan_entitlements
  for each row
  execute function update_updated_at_column();

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function update_updated_at_column();

create trigger update_charges_updated_at
  before update on charges
  for each row
  execute function update_updated_at_column();

create trigger update_payments_updated_at
  before update on payments
  for each row
  execute function update_updated_at_column();

create trigger update_payment_allocations_updated_at
  before update on payment_allocations
  for each row
  execute function update_updated_at_column();

create trigger update_schedule_templates_updated_at
  before update on schedule_templates
  for each row
  execute function update_updated_at_column();

create trigger update_sessions_updated_at
  before update on sessions
  for each row
  execute function update_updated_at_column();

create trigger update_attendance_records_updated_at
  before update on attendance_records
  for each row
  execute function update_updated_at_column();

create trigger update_private_usage_updated_at
  before update on private_usage
  for each row
  execute function update_updated_at_column();

create trigger update_entitlement_credits_updated_at
  before update on entitlement_credits
  for each row
  execute function update_updated_at_column();

create trigger update_access_overrides_updated_at
  before update on access_overrides
  for each row
  execute function update_updated_at_column();

create trigger update_waiver_medical_histories_updated_at
  before update on waiver_medical_histories
  for each row
  execute function update_updated_at_column();
