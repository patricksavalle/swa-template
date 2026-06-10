# Azure Static Web Application Template (for Agentic AI development)

> You get an empty but complete Azure Static Web App starter: 11ty pages,
> Tailwind CSS, browser TypeScript, optional TypeScript API, validation scripts, CI,
> deploy workflows, Bicep infrastructure, and agent-ready delivery guidance.
> After onboarding and deployment, you have acceptance and production Azure
> resources provisioned, app settings seeded, CI/CD wired through GitHub OIDC,
> and a prebuilt static site deployed to Azure Static Web Apps on the default
> hostname, with optional API and custom-domain/DNS steps available when needed.

## Workstation Prerequisites

Install these tools before cloning a project from the template.

| Tool | Required for |
| --- | --- |
| Git | Clone, branch, commit, push |
| Node.js 20 LTS + npm | Install dependencies, run 11ty, Tailwind CSS, TypeScript, ESLint, local tools |
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
winget install --id CoreyButler.NVMforWindows -e
```

Open a new PowerShell session so `nvm` is on `PATH`, then install Node.js 20:

```powershell
nvm install 20
nvm use 20
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
brew install git node@20 gh azure-cli
brew link --overwrite --force node@20
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

Install Node.js 20 LTS, GitHub CLI, and Azure CLI from their official package
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

## Directory Roles

- `.agents/skills/` holds the ready-to-use generic agent skills.
- `.agents/workflows/` holds agent-operated setup and delivery workflows.
- `html/` holds 11ty pages, includes, layouts, and data.
- `css/` holds Tailwind CSS input, compiled stylesheet output, and static styling assets.
- `img/` holds images and media assets.
- `api/` is the optional TypeScript Azure Functions API boundary.
- `ts/` holds TypeScript source in infrastructure, business logic, and user
  interface tiers.
- `tests/` holds cross-boundary tests that do not belong to one tier.
- `docs/` holds supporting architecture, linting, seed-secret, and skill docs.
- `scripts/` holds validation, build, release, and local automation.

## Start Here

Most setup work is agent-operable. This README is the overview; the workflow
below is the runbook to follow for a real project. Ask an agent:

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
| Cloudflare short-lived API token | Zone-scoped token with `Zone:Read` and `DNS:Edit` |

The agent can clone, rename, repoint Git, verify tools, run CI, update docs,
configure GitHub environments, register Azure providers, create deployment
identity, dispatch provisioning, and dispatch deployments once authenticated.

The human must approve or perform:

- paid Azure subscription and billing decisions
- domain purchase or registrar access
- browser logins and MFA
- registrar nameserver changes when no safe API access is configured
- secret entry or rotation
- short-lived Cloudflare API token creation and revocation
- production DNS and production deployment approval

The default Azure path expects CIAM / Entra External ID values and creates
Cosmos resources even for the empty starter site. Custom domains and Cloudflare
DNS are optional after the default Azure Static Web Apps hostname is deployed.

Manual details and exact commands live in
`.agents/workflows/new-project-onboarding.md`. Infrastructure contracts live in
`INFRASTRUCTURE.md`.

### Continue Development

- Replace placeholder content in `html/index.html`.
- Add Tailwind utilities in `html/` templates and shared Tailwind input in `css/tailwind.css`.
- Add browser TypeScript under `ts/userinterface/`.
- Add deterministic business rules under `ts/businesslogic/`.
- Add adapters/config loaders under `ts/infrastructure/`.
- Add TypeScript Azure Functions endpoints under `api/src/` and document them
  in `api/src/openapi/document.ts` only when backend endpoints are needed.
- Add focused behavior tests under `tests/` as application behavior grows.

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
api_location: ''
output_location: ''
```

Set the GitHub variable `SWA_API_LOCATION=api` only when the project should
deploy the included TypeScript Azure Functions API. When enabled, the API
serves health at `/api/health` and its OpenAPI contract at `/api/openapi.json`.

The build compiles Tailwind CSS into `css/site.css`, renders `html/` with 11ty,
copies `css/`, `img/`, and `staticwebapp.config.json` into `dist/`, then
compiles `ts/` into `dist/ts/`.

## CI/CD

The default CI workflow runs independent checks for template validation, ESLint,
TypeScript, rendered HTML, behavior tests, production dependency audit, and
secret scanning. Deployment builds and owns the immutable deploy artifact.
Deployment and provisioning are Azure-specific and use GitHub OIDC for Azure
login.

Azure workflows included:

- `Provision Azure` creates acceptance or production resources.
- `Seed Azure App Settings` reapplies CIAM and Cosmos seed settings.
- `Deploy Static Web App` deploys the prebuilt `dist/` artifact.

Azure resource names are derived from the final cloned repository name by
default. Set the GitHub variable `APP_NAME` to override the derived name.

## Agent Guidance

This project includes `AGENTS.md` and a generic skill library to keep agent
work cautious, minimal, and verification-driven.
