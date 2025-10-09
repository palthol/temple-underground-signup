# Data Model & Migrations

Tables (Supabase/Postgres)

- participants: id UUID PK, full_name, date_of_birth, address_line, city, state, zip, home_phone?, cell_phone?, email, created_at.
- emergency_contacts: id UUID PK, participant_id → participants, name, relationship, phone.
- health_assessments: id UUID PK, participant_id → participants, fields for health flags and notes.
- waivers: id UUID PK, participant_id → participants, consent flags, initials, signature_image_url, signature_vector_json, signed_at_utc.
- audit_trails: id UUID PK, participant_id, waiver_id, document_pdf_url, document_sha256, identity_snapshot, created_at, ip_address?, device_info?, locale text not null default 'en', content_version text null.

Indexes

- participants(email), participants(full_name text_pattern_ops), waivers(signed_at_utc).

Migrations

- Store SQL in `supabase/migrations/*.sql` with id-timestamp filenames.
- Use foreign keys with ON DELETE CASCADE for participant aggregates.
 - Optionally enable `unaccent` extension for accent-insensitive admin search.

Notes

- Keep Storage buckets private; store URLs and hashes in DB only.
