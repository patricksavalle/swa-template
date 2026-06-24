# Privacy Documentation

This directory holds generic privacy scaffolding for projects created from the
template. Keep these files as decision records and working inventories; put
enforceable runtime guardrails in scripts, tests, infrastructure, or lint rules.

Logging and telemetry rules are intentionally not duplicated here. Agent
instructions live in `../../.agents/skills/observability-protocol/SKILL.md`;
executable guardrails live in `../../scripts/validate-privacy-guardrails.mjs`
and run through `npm run validate`.

## Files

| File | Purpose |
| --- | --- |
| `data-inventory.md` | Working record of data categories, sources, systems, and controls. |
| `retention-matrix.md` | Retention and deletion decisions by dataset. |
| `dpia-draft.md` | DPIA working draft and pre-real-data checklist. |
| `subprocessors.md` | Provider and subprocessor register. |
| `data-subject-rights.md` | Operational runbook for access, erasure, rectification, and portability requests. |

