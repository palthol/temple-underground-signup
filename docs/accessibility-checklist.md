# Accessibility Checklist (WCAG 2.1 AA)

Forms

- Labels programmatically associated; inputs have unique `id`s.
- Descriptive helper text and error text mapped to `aria-describedby`.
- Keyboard operable; logical tab order; visible focus ring.
- Set document language via `<html lang="en|es">`; localize ARIA labels/help.

Color & Contrast

- Meet contrast ratios (4.5:1 text; 3:1 UI components).
- Do not rely on color alone for state.

Structure

- Headings in order; landmarks for main/aside/nav.
- Stepper announces progress (e.g., "Step 2 of 6").

Dynamic Content

- Announce validation and step changes via ARIA live regions when needed.
- Ensure locale changes announce appropriately and do not reset focus.

Touch Targets

- Minimum 44x44dp; spacing to avoid accidental taps.

PDF Output

- Clear text sizes; readable structure; include signer name & UTC timestamp.
