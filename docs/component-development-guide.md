# Component Development Guide

Purpose: Build and ship components that work with the form engine and controller.

Checklist

- Implement props contract from SDK.
- Register component with unique id and manifest.
- Add unit tests for value/props schema, a11y behaviors, and rendering.
- Provide story/playground examples with common states (error, disabled, long labels).

Registration

```ts
registry.register("mui.text", MuiTextField, {
  id: "mui.text",
  version: "1.0.0",
  displayName: "MUI Text Field",
});
```

Accessibility

- Ensure label association via `id`/`aria-labelledby`.
- Expose `aria-invalid` when errors exist; map helper text to `aria-describedby`.
- Keyboard operable; visible focus states.

Performance

- Memoize; keep renders cheap; avoid inline object props.
- Defer heavy assets; lazy-load component packs when possible.

Styling

- Prefer theme tokens; avoid hard-coded colors; respect density and typography scales.
