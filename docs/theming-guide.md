# Theming Guide

Goals
- Centralize brand customization via MUI theme tokens.

Tokens
- Colors: primary, secondary, error, warning, success, greys.
- Typography: base size, scale, weights; mobile-first legibility.
- Density: spacing scale; input heights; button sizes.

Implementation
- Export `theme.ts` with palette, typography, components overrides.
- Provide high-contrast mode variant.

Component Rules
- No hard-coded colors; use theme palette and variants.
- Respect reduced motion preferences.

Multi-Tenant
- Resolve theme by tenant; allow runtime theme switching.

