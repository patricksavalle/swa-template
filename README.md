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

### 5. Register Domain And Move DNS To Cloudflare

Register or select the root domain before production launch.

Domain setup:

1. Buy or select `<root-domain>` at a domain registrar.
2. Create or sign in to a [Cloudflare](https://dash.cloudflare.com/) account.
3. Add `<root-domain>` as a Cloudflare zone.
4. Review Cloudflare's imported DNS records before changing nameservers.
5. In Cloudflare, copy the two assigned authoritative nameservers.
6. At the domain registrar, replace the current nameservers with the two
   Cloudflare nameservers.
7. If DNSSEC is active at the registrar, disable it before changing
   nameservers.
8. Wait until Cloudflare marks the zone active.
9. Re-enable DNSSEC from Cloudflare after the zone is active.

Cloudflare becomes the canonical DNS control plane for the project after the
nameserver switch. Record the final domains and DNS records in
`INFRASTRUCTURE.md`.

Expected project domains:

| Role | Domain |
| --- | --- |
| Production apex | `<root-domain>` |
| Production www | `www.<root-domain>` |
| Acceptance | `acceptance.<root-domain>` |

Do not add Azure Static Web Apps custom-domain DNS records until the matching
Azure Static Web App exists. The DNS target is the SWA default hostname created
by the provisioning workflow.

References:

- [Cloudflare full setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
- [Cloudflare nameserver updates](https://developers.cloudflare.com/dns/nameservers/update-nameservers/)

### 6. Create Azure Subscription And Deployment Identity

Create or select the Azure subscription before configuring GitHub.

Azure subscription setup:

1. Sign in to the [Azure portal](https://portal.azure.com/).
2. Create a subscription in the Microsoft Entra tenant that will own the
   Azure resources.
3. Confirm the subscription owner can create resource groups and register
   resource providers.
4. Keep the subscription ID; it becomes `AZURE_SUBSCRIPTION_ID`.

Local Azure CLI check:

```bash
az login
az account list --output table
az account set --subscription "<subscription-id>"
az account show --output table
```

Register the providers used by this template:

```bash
az provider register --namespace Microsoft.Web
az provider register --namespace Microsoft.DocumentDB
az provider register --namespace Microsoft.OperationalInsights
az provider register --namespace Microsoft.Insights
az provider register --namespace Microsoft.ManagedIdentity
```

Create one Microsoft Entra app registration for GitHub Actions deployments.
Grant its service principal permission to create and update resources in the
subscription.

```bash
az ad app create --display-name "<new-repo>-github-actions"
az ad sp create --id "<application-client-id>"
az role assignment create \
  --assignee "<application-client-id>" \
  --role Contributor \
  --scope "/subscriptions/<subscription-id>"
```

Add federated credentials to the app registration for both GitHub environments:

```text
issuer: https://token.actions.githubusercontent.com
audience: api://AzureADTokenExchange
subject: repo:<owner>/<new-repo>:environment:acceptance
subject: repo:<owner>/<new-repo>:environment:production
```

The app registration values become:

| GitHub secret | Azure value |
| --- | --- |
| `AZURE_CLIENT_ID` | Application/client ID |
| `AZURE_TENANT_ID` | Directory/tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID |

The workflow creates project resources later. Do not manually create the
resource group, Static Web App, Cosmos account, Log Analytics workspace,
Application Insights resource, or managed identity unless debugging
provisioning.

The CIAM / Entra External ID tenant and app registration are separate identity
prerequisites. Create them before provisioning and keep their tenant/client
values for GitHub environment secrets.

### 7. Configure GitHub Environments

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

### 8. Provision Azure

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

### 9. Deploy

In GitHub Actions, run `Deploy Static Web App` for `acceptance`.

The deploy workflow builds once in CI, downloads the immutable `dist/`
artifact, reads the Static Web App deployment token from Azure, and uploads the
prebuilt artifact with platform builds disabled.

After acceptance is verified, run `Deploy Static Web App` for `production`.

### 10. Continue Development

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
