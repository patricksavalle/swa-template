# Architecture

## Intent

This template separates the project into a small number of durable boundaries:

- `html/` for 11ty pages, includes, layouts, and data.
- `css/` for styling.
- `img/` for image and media assets.
- `api/` for optional serverless endpoints.
- `ts/` for TypeScript source.
- `infrastructure/` for Bicep templates and environment parameters.
- `docs/decisions/` for accepted architecture decisions.
- `INFRASTRUCTURE.md` for deployed platform, environment, naming, and secrets
  contracts.
- `tests/` for cross-boundary verification.

## Stack Baseline

The initial stack decision is recorded in
`docs/decisions/0002-stack-baseline.md`.

| Area | Current baseline |
| --- | --- |
| Language | TypeScript for app and API source; JavaScript ES modules only for scripts/config |
| Static rendering | 11ty renders `html/` to `dist/` |
| Styling | Tailwind CSS compiled from `css/tailwind.css` to `css/site.css`; no inline styles |
| UI runtime | Browser-native TypeScript compiled to JavaScript; no UI framework by default |
| API | Standard TypeScript Azure Functions-compatible boundary in `api/` with health, Azure resource listing, and a source-owned OpenAPI 3.1 contract |
| Platform | Azure Static Web Apps |
| Infrastructure | Bicep in `infrastructure/` |
| CI/CD | GitHub Actions with OIDC-based Azure login |
| Enforcement | ESLint flat config plus `eslint-plugin-boundaries` |

Stack changes require an ADR update and this living architecture summary update.

## Dependency Direction

Default TypeScript dependency flow:

```text
ts/userinterface  -> ts/businesslogic
ts/userinterface  -> ts/infrastructure
ts/infrastructure -> ts/businesslogic contracts
api               -> ts/businesslogic or ts/infrastructure
tests             -> html/css/ts/api
```

Avoid dependencies from `ts/businesslogic/` into concrete UI, browser, network,
storage, or deployment implementations.

Architecture rules are declared in `eslint.architecture.mjs` files and enforced
by `npm run lint`. Static pages are rendered by 11ty from `html/` to `dist/`.
The API boundary uses TypeScript source under `api/src/` and is bundled to
`api/dist/` before deployment. It includes no-store health and Azure resource
listing endpoints plus an OpenAPI JSON endpoint at `/api/openapi.json`.

## Extension Rule

Add a new top-level directory only when it represents a new artifact type with
at least two expected files or modules. One-off files belong in the nearest
existing directory.
