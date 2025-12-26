# Waiver PDF Generation (v0.53 roadmap)

> **Status:** in progress  
> **Branch:** `feature/waiver-pdf-generation`

This iteration introduces on-demand PDF generation for Temple Underground waivers. The goal is to hydrate a Material Design–styled HTML template with data stored in Supabase and stream the finished document back to authorized callers.

## Target Experience

- **API endpoint:** `GET /api/waivers/:waiverId/pdf`
  - Accepts the waiver UUID returned after submission.
  - Authorizes requests (admin key or participant-scoped token).
  - Loads waiver, participant, medical history, emergency contact, and audit metadata.
  - Renders the HTML template into a PDF and streams it (no persistent PDF storage).

- **Admin flow**
  - Admin panel lists waivers by metadata search.
  - Selecting a waiver calls the PDF endpoint with an admin credential.
  - Response streams the hydrated PDF plus standard headers for inline or download.

- **Participant flow**
  - After completing the frontend wizard, the client already has the waiver UUID.
  - UI offers “Download PDF” (or email) by calling the same endpoint with a participant token.
  - Long term: admin dashboard can provide fuzzy search by name/email to surface waiver IDs.

## Data Contract

- Queries join:
  - `waivers`
  - `participants`
  - `waiver_medical_histories`
  - `emergency_contacts`
  - `audit_trails`
- Returns the fields described in `services/api/src/pdf/types.ts`.
- Legal copy is sourced from the existing i18n strings (`release`, `indemnification`, `media`, `acknowledgement`) based on the waiver locale.

## Rendering Pipeline

1. Fetch the joined waiver record (preferably via a DB view keyed by `waiverId`).
2. Map the record into the `WaiverPdfPayload` structure.
3. Inject payload values into `src/pdf/templates/waiver.html`.
4. Render HTML → PDF (library TBD; options include Playwright/Chromium or `@react-pdf/renderer`).
5. Respond with `application/pdf`, streaming the buffer and setting filename metadata.

## Open Tasks

Refer to the project TODO list for the live breakdown:

- Finalize renderer implementation.
- Secure the API route and add Supabase query helpers.
- Wire legal copy + locale handling.
- Hook up frontend download affordances.
- Add automated tests (renderer + endpoint).

These notes should be updated as the implementation converges or if the schema evolves.*** End Patch```} SandboxedUnable to apply patch. JSON string invalid ??? need to escape newlines, use apply_patch with freeform string. Let's call without JSON escaping: pass as raw string param. Need to abide grammar. We'll re-run properly. Use direct string, not json. Wait instructions: type apply_patch = (FREEFORM) uninterpreted string. Need to call with triple? use functions.apply_patch with string? Example earlier: called with JSON? they called bridging? sample? We'll call like:
 to open includes newline, must ensure we deliver plain string. Use python? hmm. In this environment call functions.apply_patch with string. Use in call we need to pass key? previous call we gave JSON object? Their earlier `apply_patch` calls had JSON like {"code":"..."}? Check earlier automatically? they call functions.apply_patch with string representation? we looked at previous use: 

