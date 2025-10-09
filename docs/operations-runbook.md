# Operations Runbook

Environments

- Dev, Staging, Prod Supabase projects with isolated Storage buckets.

Env Vars

- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Server: `SUPABASE_SERVICE_ROLE_KEY`, `PDF_SALT`, `JWT_SECRET` (if used).
 - i18n: `SUPPORTED_LOCALES` (e.g., `en,es`), `DEFAULT_LOCALE` (e.g., `en`).

Deploy

- Apps via Static hosting + server functions (or Node service).
- Run DB migrations before app deploy; verify Storage bucket policies.
 - Ensure locale catalogs are deployed; avoid bundling unused locales in initial chunk.

Monitoring

- Web Vitals, 4xx/5xx rates, latency on submit/admin endpoints.
- Error tracking (Sentry or similar) with PII scrubbing.
 - Track missing-key rates and i18n-related errors.

Backups

- Automated DB backups; test restore procedure quarterly.

Key Rotation

- Rotate service role keys; invalidate old signed URLs on rotation.

On-call Checks

- Admin login works; PDF download via signed URL works; new submission flow succeeds.
