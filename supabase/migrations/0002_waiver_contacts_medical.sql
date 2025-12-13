-- Expand waiver domain data storage for emergency contacts and medical histories.
-- Rollback plan: drop tables created here and drop the added column on waivers.

create table if not exists emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  waiver_id uuid not null references waivers(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  name text,
  relationship text,
  phone text,
  email text,
  created_at timestamptz default now()
);

create unique index if not exists idx_emergency_contacts_waiver on emergency_contacts(waiver_id);
create index if not exists idx_emergency_contacts_participant on emergency_contacts(participant_id);

create table if not exists waiver_medical_histories (
  id uuid primary key default gen_random_uuid(),
  waiver_id uuid not null references waivers(id) on delete cascade,
  heart_disease boolean not null default false,
  shortness_of_breath boolean not null default false,
  high_blood_pressure boolean not null default false,
  smoking boolean not null default false,
  diabetes boolean not null default false,
  family_history boolean not null default false,
  workouts boolean not null default false,
  medication boolean not null default false,
  alcohol boolean not null default false,
  last_physical text,
  exercise_restriction text,
  injuries_knees boolean not null default false,
  injuries_lower_back boolean not null default false,
  injuries_neck_shoulders boolean not null default false,
  injuries_hip_pelvis boolean not null default false,
  injuries_other_has boolean not null default false,
  injuries_other_details text,
  had_recent_injury boolean not null default false,
  injury_details text,
  physician_cleared boolean,
  clearance_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_waiver_medical_histories_waiver on waiver_medical_histories(waiver_id);

alter table waivers
  add column if not exists review_confirm_accuracy boolean not null default false;



