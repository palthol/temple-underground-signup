# API deployment inventory

**Verified:** 2026-09-05 (read-only)  
**Task:** API-OPS-001  
**No production writes. No env values set or recorded.**

## Platform and public host

| Item | Value | How verified |
| --- | --- | --- |
| Platform | **Render** (web service) | `x-render-origin-server: Render` on responses; DNS CNAME to `*.onrender.com` |
| Public hostname | **`https://api.templeunderground.com`** | DNS + live `GET /health` / `GET /health/deep` |
| Render hostname | **`https://temple-underground-signup.onrender.com`** | Same health responses; CNAME target of the public host |
| Edge | Cloudflare in front of Render | Response `server: cloudflare` |

DNS: `api.templeunderground.com` → CNAME `temple-underground-signup.onrender.com`.

### What could not be verified

- Render Dashboard service ID, plan, region, and auto-deploy branch: Render MCP
  `list_workspaces` returned **unauthorized**; `list_services` requires a confirmed
  workspace and was not available.
- Exact Render dashboard **service display name** beyond the public
  `temple-underground-signup` hostname slug.
- Which Git branch Render deploys from (no `render.yaml` in this repo).

Historical GitHub Deployments on `palthol/TU-api` from **vercel[bot]** point at
front-end projects (`temple-underground-signup-waiver-v2`, `tu_main_website`), not
this Express service. Do not treat those Vercel URLs as the API host.

## Health checks

| Method / path | Success body | Failure notes |
| --- | --- | --- |
| `GET /health` | `{ "ok": true }` | Liveness only; no DB |
| `GET /health/deep` | `{ "ok": true, "db": true }` | Hits Supabase `participants` head select; `500` with `db: false` if Supabase missing/unreachable |

Live check (2026-09-05): both paths returned HTTP 200 on
`https://api.templeunderground.com` and
`https://temple-underground-signup.onrender.com`.

Root `GET /` is not a health route (Express `Cannot GET /`).

## Runtime bind

- Process listens on `process.env.PORT` (Render injects `PORT`) or **`3001`** locally.
- Start command in this repo: `npm run start` → workspace `node src/index.js` in
  `services/api`.

## CORS

Code (`services/api/src/index.js`):

- If `ALLOWED_ORIGIN` is unset or empty → treated as missing → **default `*`**
  (`cors()` with no origin restriction).
- If `ALLOWED_ORIGIN` is set to a concrete origin → `cors({ origin: thatValue })`.

Live observation (2026-09-05): responses include
`access-control-allow-origin: *` (including preflight `OPTIONS` on `/api/lead`).
That matches either unset `ALLOWED_ORIGIN` or an explicit `*`. **Do not change
production CORS from this task.**

## Environment variable names (no values)

Names must match `services/api/.env.example`. Commit **names only**.

| Name | Role |
| --- | --- |
| `PORT` | Listen port (Render sets this) |
| `ALLOWED_ORIGIN` | CORS origin; omit or `*` for allow-all |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server only) |
| `ADMIN_API_KEY` | `x-admin-key` for `/api/admin/*` and admin PDF |
| `CRON_SECRET` | Optional `x-cron-secret` for Discord notification routes |
| `DISCORD_WEBHOOK_URL` | Optional Discord webhook |
| `SLACK_WEBHOOK_URL` | Optional Slack webhook |
| `CF_ACCESS_TEAM_DOMAIN` | Cloudflare Access team domain (viewer) |
| `CF_ACCESS_AUD` | Cloudflare Access audience (viewer) |
| `WAIVER_VIEWER_DEV_BYPASS` | Dev-only viewer auth bypass |
| `WAIVER_VIEWER_ALLOWED_EMAILS` | Viewer email allowlist |
| `SIGNATURES_BUCKET` | Storage bucket (default `signatures`) |
| `WAIVERS_BUCKET` | Storage bucket (default `signed-waivers`) |
| `PDF_ORG_NAME` | PDF letterhead org name |
| `PDF_ORG_TAGLINE` | PDF letterhead tagline |
| `PDF_ORG_ADDRESS` | PDF letterhead address |
| `API_EXPOSE_DB_ERRORS` | Expose DB errors (non-production debugging only) |

Never commit secret values, webhook URLs with tokens, JWTs, or key material.

## Ownership map (operators)

| Concern | Owner / location |
| --- | --- |
| Express API source | This repo (`services/api`) |
| Schema / migrations | This repo (`supabase/migrations/`) |
| Production DB | Supabase project `jhxzecxkccqlgyazhsnb` |
| API runtime host | Render service behind `api.templeunderground.com` |
| Waiver UI | Sibling `TU-Signup` (`VITE_API_BASE_URL` → production API) |
| Admin / receipts / waiver-viewer UIs | Sibling `admin` repo |
| Marketing site | Sibling marketing repos |

Front-end apps should point at `https://api.templeunderground.com` (no trailing slash)
for production API calls.
