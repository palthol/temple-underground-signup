# Security & Privacy

PII & Health Data
- Store structured data in Postgres; store PDFs/signatures in private Storage buckets.
- Access PDFs via short-lived signed URLs; no public exposure.

Keys & Env
- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Server: `SUPABASE_SERVICE_ROLE_KEY`, `PDF_SALT` (if used), `JWT_SECRET` (if needed).

Audit Invariants
- Persist signature vector JSON and final PDF SHA-256.
- Immutable audit rows; append-only.

Transport & Auth
- HTTPS only; HSTS; secure cookies for admin.
- Supabase Auth for admin; role `admin` enforced server-side.

Retention & Deletion
- Define retention windows; support data export and deletion requests.

Logging
- Log minimal metadata; never log raw PII in plaintext logs.

