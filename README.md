# swa-template

Generic starter template for a Static Web App style project.

This template is intentionally source-light: it defines project boundaries,
automation, documentation, and deployment hooks without prescribing a frontend
framework, API runtime, cloud provider module layout, or business domain.

## Structure

```text
swa-template/
├── .github/
│   └── workflows/
├── api/
├── app/
├── docs/
├── infrastructure/
├── packages/
├── scripts/
├── skills/
└── tests/
```

## Directory Roles

- `app/` holds the static web frontend or SPA.
- `api/` holds serverless functions or backend endpoints.
- `packages/` holds shared libraries used by `app/` and `api/`.
- `infrastructure/` holds IaC modules, environment definitions, and deployment
  parameters.
- `tests/` holds cross-boundary tests that do not belong to one package.
- `docs/` holds architecture, infrastructure, and operational decisions.
- `scripts/` holds validation, build, release, and local automation.
- `skills/` holds generic agent skills that can be installed into a target
  agent runtime or used directly by compatible agents.

## Start Here

1. Choose the frontend and API runtimes.
2. Replace placeholder README files in `app/`, `api/`, and `packages/`.
3. Fill in `docs/infrastructure.md` with the target cloud resources.
4. Review `docs/skills.md` and keep only the skills that fit the project.
5. Add real build and test commands to `package.json`.
6. Wire `.github/workflows/deploy-static-web-app.yml` to the chosen hosting
   provider.

## CI/CD

The default CI workflow validates the template, builds a placeholder artifact,
and uploads it. Deployment is intentionally a provider-neutral skeleton that
uses OIDC by default and requires explicit environment variables before it can
run.

## Agent Guidance

This project includes `AGENTS.md` and a generic skill library to keep agent
work cautious, minimal, and verification-driven.
