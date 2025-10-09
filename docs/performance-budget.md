# Performance Budget

Targets (mobile-first)

- LCP: < 2.5s on 4G fast; < 3.5s on 4G slow.
- TTI: < 3s; FID/INP minimal.
- Bundle: initial < 200KB gzip; lazy-load component packs and admin.

Strategies

- Step-level code splitting; route-based lazy import.
- Memoize fields; avoid re-renders; RHF Controller where needed.
- Debounced autosave; idle-time work; requestIdleCallback for non-critical.
- Cache schema/content; ETag and immutable assets.
- Lazy-load locale data and component packs; avoid bundling unused locales.

Diagnostics

- Lighthouse CI; Web Vitals in prod; React Profiler for hot paths.
