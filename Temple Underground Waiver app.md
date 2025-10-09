# Cursor Prompt — Temple Underground Waiver App (QR, PDF, Admin)

**Goal:** Build a modular, mobile-first web app that lets a new member scan a QR code, complete a multi-step waiver, sign with SignaturePad, and submit. The backend stores data in Supabase, generates a **signed PDF**, attaches a **simple audit trail**, and exposes an **admin panel** for search and retrieval. No end-user accounts/logins required for signing; admin access only.

## 0) Tech Stack & Non-Negotiables

- **Frontend:** React + Vite, **React Hook Form** (form state), **Yup** (validation), **Material UI (MUI)** (UI kit; themeable).
- **Signature:** **signature_pad** (SignaturePad.js) embedded in React.
- **Backend:** Node + minimal server (Express or Vite server functions), **Supabase** (Postgres + Storage + optional Auth for admin).
- **PDF generation:** Node server uses **pdf-lib** or **PDFKit** to render a final, tamper-evident PDF with embedded signature image and submission data.
- **Audit trail (simple):** store UTC timestamp, signer identity fields, raw signature stroke JSON, final PDF SHA-256 hash. (Optional IP/device capture if trivial.)
- **Accessibility:** WCAG 2.1 AA practices; labels/aria, keyboard nav, focus ring, sufficient color contrast.
- **Mobile-first:** fluid layout, touch targets, stepper progress; responsive breakpoints for tablet/desktop.
- **Modularity:** keep domain logic isolated so this app can later plug into a larger suite.

## 1) App Capabilities (MVP)

- **Public QR Flow (no login):**

  - Route: `/waiver`
  - Multi-step form: Personal → Emergency → Health → Consent/Initials → Signature → Review & Submit
  - Autosave draft (localStorage) and one-click “Save & Continue” UX
  - Browser autocomplete hints for contact fields
  - Final review screen before sign/submit

- **Submission:**

  - Server validates payload, persists DB records, renders **signed PDF**, computes **SHA-256** of PDF, uploads to Supabase Storage, stores storage URL + hash + audit JSON in DB.
  - Server returns “success” with reference ID.

- **Admin Panel (protected):**

  - Route: `/admin` (Supabase Auth: email-link or email+password)
  - Search by name/email/phone/date range; view participant profile; preview/download signed PDF; view audit JSON.
  - Basic role: `admin`
  - Log out

## 2) Data Model (Supabase / Postgres)

Create SQL or Sequelize-style models (choose one, prefer native Supabase SQL migration). Enforce FKs & indices.

**Table: `participants`**

- `id` UUID PK default gen
- `full_name` text NOT NULL
- `date_of_birth` date NOT NULL
- `address_line` text NOT NULL
- `city` text NOT NULL
- `state` text NOT NULL
- `zip` text NOT NULL
- `home_phone` text NULL
- `cell_phone` text NULL
- `email` text NOT NULL
- `created_at` timestamptz default now()

**Table: `emergency_contacts`**

- `id` UUID PK
- `participant_id` UUID FK → participants(id) ON DELETE CASCADE
- `name` text NOT NULL
- `relationship` text NOT NULL
- `phone` text NOT NULL

**Table: `health_assessments`**

- `id` UUID PK
- `participant_id` UUID FK → participants(id) ON DELETE CASCADE
- `heart_disease` boolean
- `chest_pain` boolean
- `last_physical` date NULL
- `high_blood_pressure` boolean
- `blood_pressure_level` text NULL
- `smoking` boolean
- `diabetes` boolean
- `diabetes_type` text NULL
- `family_heart_disease` boolean
- `family_details` text NULL
- `weekly_workouts` boolean
- `medications` boolean
- `medication_details` text NULL
- `alcohol` boolean
- `injuries_knees` boolean
- `injuries_back` boolean
- `injuries_neck_shoulders` boolean
- `injuries_hip_pelvis` boolean
- `injuries_other` boolean
- `injuries_notes` text NULL
- `exercise_restrictions` boolean
- `restriction_notes` text NULL

**Table: `waivers`**

- `id` UUID PK
- `participant_id` UUID FK → participants(id) ON DELETE CASCADE
- `consent_acknowledged` boolean NOT NULL
- `initials_risk_assumption` text NOT NULL
- `initials_release` text NOT NULL
- `initials_indemnification` text NOT NULL
- `initials_media_release` text NOT NULL
- `signature_image_url` text NOT NULL // Supabase Storage URL (PNG)
- `signature_vector_json` jsonb NOT NULL // raw signature_pad data for defensibility
- `signed_at_utc` timestamptz NOT NULL default now()

**Table: `audit_trails`**

- `id` UUID PK
- `participant_id` UUID FK → participants(id) ON DELETE CASCADE
- `waiver_id` UUID FK → waivers(id) ON DELETE CASCADE
- `document_pdf_url` text NOT NULL // Supabase Storage URL of final signed PDF
- `document_sha256` text NOT NULL
- `identity_snapshot` jsonb NOT NULL // name/email/phone/DOB at time of signing
- `created_at` timestamptz default now()
- Optional fields if trivial to capture: `ip_address` text NULL, `device_info` jsonb NULL

Create helpful indexes: email, full_name text_pattern_ops, signed_at_utc.

## 3) Form Fields (derived from existing waiver)

Implement these inputs and group them across steps. (Use MUI components; add descriptive labels/tooltips; keep `aria-describedby` for helper text.)
**Personal & Contact**: Name, Date of Birth, Address, City, State/Zip, Home Phone, Cell Phone, Email, Emergency Contact (Name/Relationship/Phone). These mirror your document’s header and emergency contact block .
**Health Assessment** (Yes/No + conditional text inputs): Heart disease; Shortness of breath/chest pains; Date of last full physical; High blood pressure (+ level); Cigarette smoking; Diabetes (+ type); Family history of heart disease (+ who/age); Weekly workouts (≥3x/week); Medications (+ list); Alcohol; Problem areas (Knees/Lower Back/Neck-Shoulders/Hip-Pelvis/Other + notes); Any reason not to exercise (+ explanation). These reflect the health checklist lines in your document .
**Informed Consent / Assumption of Risk**: Present the full consent text; require **initial boxes** for (1) Risk Assumption, (2) Release, (3) Indemnification, (4) Use of picture/likeness, plus **signature** and **date** (guardian signature if minor). Content follows your existing waiver paragraphs and initial lines .

## 4) Validation (Yup)

- Required: name, DOB (18+ optional check), address, city, state, zip, email (valid), emergency contact, consent acknowledgment, all required initials, signature.
- Conditional: any “Yes” in health section requires its explanation field.
- UX: inline errors, step-blocking until valid, “Review” page with red badges for missing items.

## 5) Signature (SignaturePad.js)

- Add canvas with clear/reset.
- Export **PNG** (trim transparent whitespace) and **raw vector JSON** (from signature_pad) in submission payload.
- Show signature preview in Review step.

## 6) PDF Generation (Server)

- Use **pdf-lib** (or **PDFKit**) to render a page with:

  - Header: “Temple Underground Association, LLC — Health Assessment & Waiver”
  - Sections mirroring submitted data (personal, emergency, health answers, consent text summary).
  - Embedded signature image at the signature line, printed signer name, and UTC timestamp.
  - Optional watermark: “Digitally signed” + reference ID.

- Serialize PDF buffer → compute **SHA-256** → upload to Supabase Storage `signed-waivers/{waiverId}.pdf`.
- Persist PDF URL + hash to `audit_trails`.

## 7) Simple Audit Trail (JSON)

Server builds and stores:

```json
{
  "signed_at": "2025-10-01T00:00:00Z",
  "identity": {
    "full_name": "...",
    "email": "...",
    "phone": "...",
    "date_of_birth": "YYYY-MM-DD"
  },
  "signature": {
    "image_url": "supabase://.../signature.png",
    "vector_json": { "points": [ ... ] }
  },
  "document_pdf_url": "supabase://.../waiver.pdf",
  "document_sha256": "abcdef1234..."
}
```

Keep it simple; only add `ip_address`/`device_info` if trivial (don’t block MVP).

## 8) Routes / API Shape

- `POST /api/waivers/submit`

  - Body: `{ participant, emergency_contact, health_assessment, consent: {...initials... , consent_acknowledged}, signature:{ pngDataUrl, vectorJson } }`
  - Server: validate → upsert participant → insert health_assessment & waiver → generate PDF → compute hash → upload PDF & signature → insert audit_trail → return `{ ok: true, waiverId, participantId }`

- `GET /api/admin/waivers?query=...&from=...&to=...` (admin only)

  - Search by name/email/phone/date

- `GET /api/admin/waivers/:id` (admin only)

  - Returns participant profile, waiver metadata, audit JSON, URLs

- `GET /api/admin/waivers/:id/pdf` (admin only)

  - Streams/redirects to Storage URL

## 9) Admin Panel (MUI)

- Supabase Auth protected (`/admin/login`)
- Views:

  - **Search** (name/email/phone/date range), paginated results
  - **Detail** (participant info, health summary, consent initials, signed time, signature preview, “Open PDF” button, audit JSON accordion)

- Export actions: Download PDF, Copy reference ID

## 10) Theming & Responsiveness

- Provide MUI theme with:

  - Editable palette (primary/accent/greys)
  - Adjustable opacity utilities
  - Typography scale tuned for mobile readability

- Breakpoints: xs (phone), sm (small tablet), md (tablet), lg (laptop+)
- Large tap targets for mobile, stepper at top, sticky “Next/Back” on small screens

## 11) Security & Privacy

- PII + health fields → store in Postgres; PDFs/signatures in Storage with **private** buckets.
- Generate signed URLs for admin viewing only.
- Server computes SHA-256 of final PDF and stores in DB to detect tampering.
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (frontend); `SUPABASE_SERVICE_ROLE_KEY` (server), `PDF_SALT` (if needed for deterministic file names).

## 12) DX & Structure

Create this structure:

```
/apps/web
  /src
    /components (form steps, signature canvas, stepper)
    /features/waiver (hooks, schemas, API client)
    /features/admin (search table, detail view)
    /pages (Waiver.tsx, Admin.tsx, Login.tsx)
    /lib (supabaseClient.ts, fetcher.ts)
    /server (api routes: submit, admin)
  /public (favicon, qr landing assets)
  /styles (theme.ts)
supabase/
  migrations/*.sql
```

Add scripts: `dev`, `build`, `start`. Include linting (ESLint), formatting (Prettier), and basic tests for schemas.

## 13) Dependencies

- react, react-dom, vite
- @mui/material @mui/icons-material @emotion/react @emotion/styled
- react-hook-form, @hookform/resolvers, **yup**
- signature_pad
- pdf-lib (or pdfkit + font assets)
- crypto (node) for SHA-256
- supabase-js
- zod (optional if replacing Yup later)
- jose (optional, if JWT needed between server/frontend)

## 14) Acceptance Criteria

- ✅ Mobile user can complete form, sign with finger, submit successfully.
- ✅ Server persists data, generates PDF with embedded signature, stores in Supabase, computes/stores SHA-256.
- ✅ Admin can log in, search records, preview signature, download PDF, view audit JSON.
- ✅ All required fields/initials enforced; conditional “explain” fields gated by Yes/No.
- ✅ Theming is editable (colors/opacity) without code overhaul.
- ✅ Code is modular so this app can later integrate with other proprietary apps.

---

### Notes for Cursor

- Generate the SQL (or Supabase migration) for all tables and FKs.
- Scaffold React pages/components and the server endpoints.
- Implement Yup schemas matching the fields listed above (derived from the provided waiver text) .
- Use MUI’s theme provider with a clearly documented palette export.
- Implement PDF generation with a clean template and include signature image, printed name, and UTC timestamp on a signature line.
- Implement SHA-256 hashing of the final PDF **after** all content is embedded; persist hash + URL in `audit_trails`.
- Admin panel must be gated by Supabase Auth; public waiver route requires no auth.

---

If you want, I can also provide sample **Yup schemas** and a **PDF template layout spec** in a follow-up you can drop into the codebase.
