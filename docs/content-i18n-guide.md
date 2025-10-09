# Content & i18n Guide

Goals
- Edit text content externally without redeploying.
- Support per-tenant branding and locales with fallbacks.

Model
```json
{
  "form.title": { "default": "Temple Underground Waiver", "en": "Temple Underground Waiver" },
  "full_name": { "default": "Full Name" },
  "dob": { "default": "Date of Birth" }
}
```

Conventions
- Keys are stable identifiers referenced by schema `...Key` fields.
- Avoid embedding business logic in content; keep content pure text/HTML.

Locales & Fallbacks
- Resolve by `(tenant → locale → default)`.
- Missing keys should surface warnings in dev.

Workflows
- Draft → Review → Publish with version tags.
- Keep history; allow diff to previous versions.

Live Preview
- In controller, broadcast content changes via shared store or `postMessage` to running app preview.

