# Archived documentation

These files are kept for history. They are **not** the live task list, schema source of truth, or API contract.

Current replacements:

| Need | Use instead |
| --- | --- |
| Status | [../current-state.md](../current-state.md) |
| Tasks | [../../work-queue/README.md](../../work-queue/README.md) |
| HTTP contracts | [../admin-api.md](../admin-api.md) |
| Schema vs live DB | [../api-schema-audit.md](../api-schema-audit.md) |
| Capability matrix | [../api-capability-audit.md](../api-capability-audit.md) |

## Why these were archived

- **`working/`** — Phase handoff notes, a schema-alignment snapshot pinned to migrations `0001`–`0012`, and one-off validation SQL from 2026. The SQL packs are still runnable; they are just not operating docs.
- **`infrastructure-additions-checklist.md`** — Tier 1–3 rollout list. Scheduling/subscription APIs shipped after it was written. Execution moved to the work queue so two competing checklists would not stay in `docs/`.

Do not add new work here. If a fact in an archived file is still true, copy it into a live doc and cite the archive only as provenance.
