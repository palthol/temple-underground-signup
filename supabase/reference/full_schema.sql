-- Reconstructed DDL for public schema
-- Note: requires the pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- participants
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  address_line text,
  city text,
  state text,
  zip text,
  home_phone text,
  cell_phone text,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_full_name ON participants(full_name);

-- waivers
CREATE TABLE IF NOT EXISTS waivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  consent_acknowledged boolean,
  initials_risk_assumption text,
  initials_release text,
  initials_indemnification text,
  initials_media_release text,
  signature_image_url text,
  signature_vector_json jsonb,
  signed_at_utc timestamptz DEFAULT now(),
  review_confirm_accuracy boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_waivers_signed_at ON waivers(signed_at_utc);

-- audit_trails
CREATE TABLE IF NOT EXISTS audit_trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  waiver_id uuid REFERENCES waivers(id) ON DELETE CASCADE,
  document_pdf_url text,
  document_sha256 text,
  identity_snapshot jsonb,
  locale text NOT NULL DEFAULT 'en',
  content_version text,
  created_at timestamptz DEFAULT now()
);

-- emergency_contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  waiver_id uuid NOT NULL REFERENCES waivers(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  name text,
  relationship text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Unique: one emergency contact per waiver (matches current DB)
CREATE UNIQUE INDEX IF NOT EXISTS idx_emergency_contacts_waiver ON emergency_contacts(waiver_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_participant ON emergency_contacts(participant_id);

-- waiver_medical_histories
CREATE TABLE IF NOT EXISTS waiver_medical_histories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  waiver_id uuid NOT NULL REFERENCES waivers(id) ON DELETE CASCADE,
  heart_disease boolean NOT NULL DEFAULT false,
  shortness_of_breath boolean NOT NULL DEFAULT false,
  high_blood_pressure boolean NOT NULL DEFAULT false,
  smoking boolean NOT NULL DEFAULT false,
  diabetes boolean NOT NULL DEFAULT false,
  family_history boolean NOT NULL DEFAULT false,
  workouts boolean NOT NULL DEFAULT false,
  medication boolean NOT NULL DEFAULT false,
  alcohol boolean NOT NULL DEFAULT false,
  last_physical text,
  exercise_restriction text,
  injuries_knees boolean NOT NULL DEFAULT false,
  injuries_lower_back boolean NOT NULL DEFAULT false,
  injuries_neck_shoulders boolean NOT NULL DEFAULT false,
  injuries_hip_pelvis boolean NOT NULL DEFAULT false,
  injuries_other_has boolean NOT NULL DEFAULT false,
  injuries_other_details text,
  had_recent_injury boolean NOT NULL DEFAULT false,
  injury_details text,
  physician_cleared boolean,
  clearance_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waiver_medical_histories_waiver ON waiver_medical_histories(waiver_id);

-- Optional: recreate view view_waiver_documents if needed (not included)
-- If you want the view DDL extracted too, confirm and I'll retrieve it.

-- End of reconstructed DDL