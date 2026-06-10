# swa-template

Generic starter template for a Static Web App style project.

This template is intentionally source-light: it defines project boundaries,
automation, documentation, and deployment hooks without prescribing a frontend
framework, API runtime, cloud provider module layout, or business domain.

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
├── scripts/
├── ts/
│   ├── infrastructure/
│   ├── businesslogic/
│   └── userinterface/
└── tests/
```

## Directory Roles

- `.agents/skills/` holds the ready-to-use generic agent skills.
- `html/` holds static HTML entry points and document fragments.
- `css/` holds stylesheets, design tokens, and static styling assets.
- `img/` holds images and media assets.
- `ts/` holds TypeScript source in infrastructure, business logic, and user
  interface tiers.
- `tests/` holds cross-boundary tests that do not belong to one tier.
- `docs/` holds architecture, infrastructure, and operational decisions.
- `scripts/` holds validation, build, release, and local automation.

## Start Here

1. Choose the frontend runtime, if plain HTML/CSS/TypeScript is not enough.
2. Replace placeholder README files in `html/`, `css/`, `img/`, and `ts/`.
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
