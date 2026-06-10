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
- `docs/` holds supporting architecture, linting, seed-secret, and skill docs.
- `scripts/` holds validation, build, release, and local automation.

## Start Here

Use this sequence for a new project based on the template.

### 1. Clone And Rename

```bash
git clone https://github.com/patricksavalle/swa-template.git <new-repo>
cd <new-repo>
git remote set-url origin https://github.com/<owner>/<new-repo>.git
npm pkg set name="<new-repo>"
```

Also update the README title and any visible placeholder copy before the first
project commit.

### 2. Verify Locally

```bash
npm ci
npm run ci
```

For local development:

```bash
npm run dev
```

The local server renders 11ty pages from `html/`, copies static assets from
`css/` and `img/`, and compiles TypeScript from `ts/`.

### 3. Set Project Decisions

Before feature work, review:

- `docs/decisions/0001-template-boundaries.md`
- `docs/decisions/0002-stack-baseline.md`
- `docs/architecture.md`
- `docs/skills.md`
- `INFRASTRUCTURE.md`

Keep the default stack unless the project records a new ADR. Add app code in
`html/`, `css/`, `img/`, `api/`, and `ts/`. Keep or tighten the generic
architecture rules in `eslint.architecture.mjs`.

### 4. Push The New Repository

```bash
git push -u origin main
```

GitHub Actions will run `CI`, which validates the template, lints, typechecks,
builds `dist/`, and runs the placeholder test.

### 5. Configure GitHub Environments

Create two GitHub environments:

- `acceptance`
- `production`

Add these secrets to each environment:

| Secret | Purpose |
| --- | --- |
| `AZURE_CLIENT_ID` | Federated Azure deployment identity client ID |
| `AZURE_TENANT_ID` | Azure tenant ID for OIDC login |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `CIAM_TENANT_ID` | External identity tenant ID |
| `CIAM_TENANT_NAME` | External identity tenant name |
| `CIAM_CLIENT_ID` | External identity app registration client ID |
| `CIAM_CLIENT_SECRET` | External identity app registration client secret |

Optional variable:

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | Overrides the repository-derived Azure resource name prefix |

The Azure identity behind `AZURE_CLIENT_ID` must have a federated credential for
the GitHub repository and permission to create/update the target resource
groups.

### 6. Provision Azure

In GitHub Actions, run `Provision Azure` for `acceptance` first. The workflow
creates:

- resource group
- Azure Static Web App
- Cosmos DB for NoSQL
- Log Analytics
- Application Insights
- user-assigned managed identity
- Static Web App application settings

After acceptance succeeds, run the same workflow for `production`.

### 7. Deploy

In GitHub Actions, run `Deploy Static Web App` for `acceptance`.

The deploy workflow builds once in CI, downloads the immutable `dist/`
artifact, reads the Static Web App deployment token from Azure, and uploads the
prebuilt artifact with platform builds disabled.

After acceptance is verified, run `Deploy Static Web App` for `production`.

### 8. Continue Development

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
