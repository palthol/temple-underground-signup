# Waiver PDF generation

> **Status:** backend implemented; participant and viewer download flows incomplete
>
> **Verified:** 2026-09-03

This iteration introduces on-demand PDF generation for Temple Underground waivers. The goal is to hydrate a Material Design–styled HTML template with data stored in Supabase and stream the finished document back to authorized callers.

## Target Experience

- **API endpoint:** `GET /api/waivers/:waiverId/pdf`
  - Accepts the waiver UUID returned after submission.
  - Authorizes requests with the admin key. Participant-scoped authorization is not
    implemented.
  - Loads waiver, participant, medical history, emergency contact, and audit metadata.
  - Renders the HTML template into a PDF and streams it (no persistent PDF storage).

- **Admin flow**
  - Admin panel lists waivers by metadata search.
  - The current admin dashboard instead opens the persisted signed PDF URL returned by
    `GET /api/admin/waivers/:id`; it does not call this rendering endpoint.
  - Response streams the hydrated PDF plus standard headers for inline or download.

- **Participant flow**
  - After completing the frontend wizard, the client already has the waiver UUID.
  - The current participant UI is in a separate repository and is not wired to this
    endpoint with a participant token.
  - Long term: admin dashboard can provide fuzzy search by name/email to surface waiver IDs.

## Data Contract

- Queries join:
  - `waivers`
  - `participants`
  - `waiver_medical_histories`
  - `emergency_contacts`
  - `audit_trails`
- Maps the fetched rows through `services/api/src/pdf/data/mapWaiverToPayload.js`.
- Legal copy is sourced from the existing i18n strings (`release`, `indemnification`, `media`, `acknowledgement`) based on the waiver locale.

## Rendering Pipeline

1. Fetch the waiver and related records through `fetchWaiverById`.
2. Map the record into the `WaiverPdfPayload` structure.
3. Inject payload values into `src/pdf/templates/waiver.html`.
4. Render HTML → PDF with Playwright/Chromium.
5. Respond with `application/pdf`, streaming the buffer and setting filename metadata.

## Open Tasks

- Keep the admin-only renderer and its tests healthy.
- Decide whether the viewer should receive signed document URLs or a dedicated download
  endpoint rather than displaying raw storage paths.
- Design participant-scoped authorization before exposing on-demand generation to a
  participant client.
- Add a frontend download affordance only after the authorization decision is recorded.
