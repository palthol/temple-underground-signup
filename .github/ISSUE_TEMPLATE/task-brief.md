---
name: Task Brief
about: Structured brief for an implementation task
title: ""
labels: ["task"]
assignees: []
---

## Goal

One sentence describing the intended outcome.

## Scope

Files/modules allowed to change; related features explicitly excluded.

## Constraints

Auth (`x-admin-key` / cron / Cloudflare Access), money in integer cents, migration safety, no production writes unless the task authorizes them.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Non-Goals

Explicitly out of scope for this task.

## Risks / Tradeoffs

Known constraints or debt tolerated; potential rollbacks.

## Testing

Unit/integration; waiver guard if schema-touched; PDF snapshots if the renderer changed.

## Docs

Which docs to update (`admin-api.md`, schema audit, `current-state.md`, work-queue).

## Rollout

Feature flags, migration steps, and rollback notes.

