# Content & i18n Guide

Goals

- Edit text content externally without redeploying.
- Support per-tenant branding and locales with fallbacks.

Model

```json
{
  "form.title": {
    "default": "Temple Underground Waiver",
    "en": "Temple Underground Waiver"
  },
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

Spanish Localization Additions

- Provide Spanish content catalogs alongside English; ensure legal text parity.
- Example keys include `es` entries (e.g., `"Nombre completo"`, `"Fecha de nacimiento"`).
- Controller UI supports per-locale tabs and missing-key highlighting for ES.
- Preview can switch EN/ES; verify layout for longer Spanish strings.
