# Cloud Agent launch prompts

Paste **one** of these into a new Cursor Cloud Agent. Each prompt is a single
task. Do not combine them in one run.

Ready tasks:

| Task | Prompt | Lane |
| --- | --- | --- |
| [API-VAL-002](../tasks/API-VAL-002.md) | [API-VAL-002.md](./API-VAL-002.md) | validation smoke |
| [API-HARD-002](../tasks/API-HARD-002.md) | [API-HARD-002.md](./API-HARD-002.md) | backend hardening |

These two may run **in parallel**. They share `docs/current-state.md` and the
queue index files — each agent may edit **only its own** `queue.json` /
README row, and only its own domain rows in `current-state.md`.

Production writes are **not** authorized.
