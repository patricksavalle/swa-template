# swa-template

Generic starter template for an Azure Static Web App project with 11ty.

This template uses 11ty as the static site generator and keeps the source
layout deliberately flat.

## Structure

```text
swa-template/
├── .agents/
│   └── skills/
├── .github/
│   └── workflows/
├── css/
├── docs/
├── html/
├── img/
├── api/
├── scripts/
├── ts/
│   ├── infrastructure/
│   ├── businesslogic/
│   └── userinterface/
└── tests/
```

## Directory Roles

- `.agents/skills/` holds the ready-to-use generic agent skills.
- `html/` holds 11ty pages, includes, layouts, and data.
- `css/` holds stylesheets, design tokens, and static styling assets.
- `img/` holds images and media assets.
- `api/` is the optional Azure Functions or serverless API boundary.
- `ts/` holds TypeScript source in infrastructure, business logic, and user
  interface tiers.
- `tests/` holds cross-boundary tests that do not belong to one tier.
- `docs/` holds architecture, infrastructure, and operational decisions.
- `scripts/` holds validation, build, release, and local automation.

## Start Here

1. Edit 11ty pages in `html/`.
2. Replace placeholder files in `css/`, `img/`, `api/`, and `ts/`.
3. Fill in `docs/infrastructure.md` with the target cloud resources.
4. Review `docs/skills.md` and keep only the skills that fit the project.
5. Keep or tighten the generic lint rules in `eslint.architecture.mjs`.
6. Wire `.github/workflows/deploy-static-web-app.yml` to the chosen hosting
   provider.

## SWA Locations

Default locations:

```text
app_location: .
api_location: api
output_location: dist
```

The build renders `html/` with 11ty, copies `css/`, `img/`, and
`staticwebapp.config.json` into `dist/`, then compiles `ts/` into `dist/ts/`.

## CI/CD

The default CI workflow validates the template, builds the 11ty site artifact,
checks ESLint and TypeScript, and uploads the `dist/` artifact. Deployment and
provisioning are Azure-specific and use GitHub OIDC for Azure login.

Azure workflows included:

- `Provision Azure` creates acceptance or production resources.
- `Seed Azure App Settings` reapplies CIAM and Cosmos seed settings.
- `Deploy Static Web App` deploys the prebuilt `dist/` artifact.

Azure resource names are derived from the final cloned repository name by
default. Set the GitHub variable `APP_NAME` to override the derived name.

## Agent Guidance

This project includes `AGENTS.md` and a generic skill library to keep agent
work cautious, minimal, and verification-driven.
