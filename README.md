# swa-template

Generic starter template for an Azure Static Web App project with 11ty.

This template uses 11ty as the static site generator and keeps the source
layout deliberately flat.

## Workstation Prerequisites

Install these tools before cloning a project from the template.

| Tool | Required for |
| --- | --- |
| Git | Clone, branch, commit, push |
| Node.js LTS + npm | Install dependencies, run 11ty, TypeScript, ESLint, local tools |
| GitHub CLI (`gh`) | GitHub authentication, repo setup, Actions and environment checks |
| Azure CLI (`az`) | Azure login, Bicep validation, manual provisioning checks |
| Azure Static Web Apps CLI (`swa`) | Optional local SWA emulation and direct SWA commands |
| Cloudflare Wrangler (`wrangler`) | Optional Cloudflare DNS, Workers, Pages, or edge integrations |

Official install references:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download)
- [GitHub CLI](https://github.com/cli/cli#installation)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/docs/use/install/)
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Windows

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id GitHub.cli -e
winget install --id Microsoft.AzureCLI -e
npm install -g @azure/static-web-apps-cli
```

Wrangler is best installed per project once Cloudflare is needed:

```powershell
npm install -D wrangler@latest
```

### macOS

```bash
brew install git node gh azure-cli
npm install -g @azure/static-web-apps-cli
```

Wrangler is best installed per project once Cloudflare is needed:

```bash
npm install -D wrangler@latest
```

### Ubuntu / Debian / WSL

```bash
sudo apt-get update
sudo apt-get install -y git curl ca-certificates
```

Install Node.js LTS, GitHub CLI, and Azure CLI from their official package
sources, then install the SWA CLI with npm:

```bash
npm install -g @azure/static-web-apps-cli
```

Wrangler is best installed per project once Cloudflare is needed:

```bash
npm install -D wrangler@latest
```

### Verify Tools

```bash
git --version
node --version
npm --version
gh --version
az version
az bicep version
swa --version
npx wrangler --version
```

If `az bicep version` fails because Bicep is missing:

```bash
az bicep install
```

### Authenticate Tools

```bash
gh auth login
az login
npx wrangler login
```

`npx wrangler login` is only needed for projects that use Cloudflare.

## Structure

```text
swa-template/
├── .agents/
│   ├── skills/
│   └── workflows/
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
- `.agents/workflows/` holds agent-operated setup and delivery workflows.
- `html/` holds 11ty pages, includes, layouts, and data.
- `css/` holds stylesheets, design tokens, and static styling assets.
- `img/` holds images and media assets.
- `api/` is the optional Azure Functions or serverless API boundary.
- `ts/` holds TypeScript source in infrastructure, business logic, and user
  interface tiers.
- `tests/` holds cross-boundary tests that do not belong to one tier.
- `docs/` holds supporting architecture, linting, seed-secret, and skill docs.
- `scripts/` holds validation, build, release, and local automation.

## Start Here

Most setup work is agent-operable. Ask an agent:

```text
Use .agents/workflows/new-project-onboarding.md to create a new project from
this template. Pause for human approval before paid subscriptions, registrar
changes, production DNS, secrets, or production deployment.
```

Give the agent:

| Input | Example |
| --- | --- |
| Repository owner | `example-org` |
| Repository name | `example-app` |
| Root domain | `example.com` |
| Azure subscription ID | `00000000-0000-0000-0000-000000000000` |
| Azure tenant ID | `00000000-0000-0000-0000-000000000000` |
| CIAM tenant/client values | project-specific |

The agent can clone, rename, repoint Git, verify tools, run CI, update docs,
configure GitHub environments, register Azure providers, create deployment
identity, dispatch provisioning, and dispatch deployments once authenticated.

The human must approve or perform:

- paid Azure subscription and billing decisions
- domain purchase or registrar access
- browser logins and MFA
- registrar nameserver changes when no safe API access is configured
- secret entry or rotation
- production DNS and production deployment approval

Manual details and exact commands live in
`.agents/workflows/new-project-onboarding.md`. Infrastructure contracts live in
`INFRASTRUCTURE.md`.

### Continue Development

- Replace placeholder content in `html/index.html`.
- Add styles in `css/site.css`.
- Add browser code under `ts/userinterface/`.
- Add deterministic business rules under `ts/businesslogic/`.
- Add adapters/config loaders under `ts/infrastructure/`.
- Add Azure Functions endpoints under `api/` only when backend endpoints are
  needed.
- Replace `scripts/test-placeholder.mjs` with real tests once application
  behavior exists.

## SWA Locations

Local SWA CLI locations:

```text
app_location: .
api_location: api
output_location: dist
```

Deploy workflow locations:

```text
app_location: dist
api_location: api
output_location: ''
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
