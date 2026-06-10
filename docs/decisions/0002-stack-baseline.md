# 0002. Stack Baseline

## Status

Accepted

## Context

The template must be ready after clone and rename without forcing a heavy
frontend framework, a private platform convention, or project-specific business
logic. The baseline stack must be explicit so a new project can provision,
build, and deploy before product code exists.

## Decision

Use this initial stack:

| Area | Decision |
| --- | --- |
| Language | TypeScript for application source; JavaScript/ES modules for build scripts and configuration |
| Static rendering | 11ty renders `html/` into `dist/` |
| Styling | Plain CSS in `css/`; no inline styles |
| UI runtime | Browser-native JavaScript; no React, Vue, Angular, Svelte, or similar UI framework |
| Serverless API | Optional Azure Functions-compatible boundary in `api/` |
| Platform | Azure Static Web Apps |
| Infrastructure | Bicep in `infrastructure/` |
| CI/CD | GitHub Actions with OIDC-based Azure login |
| Architecture enforcement | ESLint flat config plus `eslint-plugin-boundaries` |
| Agent guidance | Generic skills vendored in `.agents/skills/` |

The build artifact is `dist/`. Deployment must upload the prebuilt artifact and
must not rely on the deploy platform to rebuild source.

`INFRASTRUCTURE.md` records the deployed Azure topology, environment contract,
secret inventory, naming rules, and operational workflows. It does not own the
application stack decision.

`docs/architecture.md` records the current living architecture summary. ADRs in
`docs/decisions/` record durable decisions and their rationale.

## Consequences

- A cloned repository can run CI before project-specific code exists.
- Projects can add a UI framework only through a new architecture decision.
- Runtime JavaScript remains small and progressively enhances static output.
- Provider-specific deployment details stay in `INFRASTRUCTURE.md`.
- Stack changes require both an ADR update and a living architecture update.
