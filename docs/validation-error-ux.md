# Validation & Error UX

Principles

- Prevent invalid submissions while keeping progress fluid.
- Show inline errors and a summarized list per step.

Client Validation

- React Hook Form + Yup: required fields, formats, conditional rules.
- Debounced validation on blur/change; validate on step next.
 - Localize messages via content keys; Spanish catalogs for error text.

Server Validation

- Mirror rules; enforce invariants and data types.
- Return structured errors `{ field, messageKey }` for mapping.
 - Accept `locale` and return localized message keys where admin UI displays them.

Error Presentation

- Inline message under field; `aria-invalid` and `aria-describedby`.
- ErrorSummary at top of step focusing first error.

Conditional Fields

- Only require when visible; hide with preservation of value unless logic demands clearing.

Accessibility

- Keyboard/reader friendly errors; maintain focus order; announce updates.
