-- Enable unaccent extension optionally for accent-insensitive search
-- create extension if not exists unaccent;

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  date_of_birth date not null,
  address_line text,
  city text,
  state text,
  zip text,
  home_phone text,
  cell_phone text,
  email text not null,
  created_at timestamptz default now()
);

create table if not exists waivers (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  consent_acknowledged boolean,
  initials_risk_assumption text,
  initials_release text,
  initials_indemnification text,
  initials_media_release text,
  signature_image_url text,
  signature_vector_json jsonb,
  signed_at_utc timestamptz default now()
);

create table if not exists audit_trails (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  waiver_id uuid references waivers(id) on delete cascade,
  document_pdf_url text,
  document_sha256 text,
  identity_snapshot jsonb,
  locale text not null default 'en',
  content_version text,
  created_at timestamptz default now()
);

create index if not exists idx_participants_email on participants(email);
create index if not exists idx_participants_full_name on participants(full_name);
create index if not exists idx_waivers_signed_at on waivers(signed_at_utc);

