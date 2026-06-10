# New Project Onboarding

Use this workflow to turn a fresh `swa-template` clone into a named project
that can be provisioned and deployed.

## Inputs

Collect these before changing files or cloud state:

| Input | Example | Owner |
| --- | --- | --- |
| Repository owner | `example-org` | Human |
| Repository name | `example-app` | Human |
| Root domain | `example.com` | Human |
| Azure subscription ID | `00000000-0000-0000-0000-000000000000` | Human |
| Azure tenant ID | `00000000-0000-0000-0000-000000000000` | Human |
| CIAM tenant/client values | project-specific | Human |
| Cloudflare account access | browser/API login | Human |
| GitHub access | `gh auth login` | Human |

Never ask the user to paste secrets into chat unless there is no safer local
path. Prefer `gh secret set`, Azure CLI, Cloudflare CLI, or provider portals.

## Agent Scope

The agent MAY do:

- check local tool versions
- install project npm dependencies
- rename package metadata and README placeholders
- update Git remotes
- run validation, lint, typecheck, build, and tests
- update ADRs, `docs/architecture.md`, and `INFRASTRUCTURE.md`
- prepare GitHub environments and variables through `gh`
- create Azure app registrations, service principals, role assignments, and
  provider registrations through `az` after the human logs in
- dispatch GitHub Actions workflows
- add Cloudflare DNS records through Wrangler/API after the human authorizes
  Cloudflare access

The human MUST do:

- approve paid accounts, subscriptions, and billing scopes
- buy or select the root domain
- complete browser-based logins and MFA
- change registrar nameservers when no safe API access is configured
- provide or rotate CIAM/client secrets
- approve production DNS and production deployment

## Workflow

### 1. Tool Audit

Run:

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

If Bicep is missing:

```bash
az bicep install
```

If authentication is missing, ask the human to complete:

```bash
gh auth login
az login
npx wrangler login
```

### 2. Clone, Rename, And Verify

```bash
git clone https://github.com/patricksavalle/swa-template.git <new-repo>
cd <new-repo>
git remote set-url origin https://github.com/<owner>/<new-repo>.git
npm pkg set name="<new-repo>"
npm ci
npm run ci
```

Update:

- `README.md` title and visible placeholder text
- `docs/decisions/0002-stack-baseline.md` only if the stack changes
- `docs/architecture.md` if the module map changes
- `INFRASTRUCTURE.md` with real domains and environment names

### 3. GitHub Repository And Environments

Create or confirm the GitHub repository, then push:

```bash
git push -u origin main
```

Create environments:

```bash
gh api repos/<owner>/<new-repo>/environments/acceptance --method PUT
gh api repos/<owner>/<new-repo>/environments/production --method PUT
```

Set optional repository or environment variable:

```bash
gh variable set APP_NAME --body "<app-name>"
```

Set secrets through `gh secret set` or the GitHub UI. Do not echo secret values
to the terminal.

### 4. Domain And Cloudflare

Confirm the human has registered `<root-domain>` and added it as a Cloudflare
zone.

If nameservers are not delegated to Cloudflare:

1. Ask the human to copy the two Cloudflare-assigned nameservers.
2. Ask the human to update nameservers at the registrar.
3. Ask the human to disable registrar DNSSEC before the move if active.
4. Wait for the Cloudflare zone to become active.
5. Ask the human to re-enable DNSSEC from Cloudflare.

Record planned domains in `INFRASTRUCTURE.md`:

- `<root-domain>`
- `www.<root-domain>`
- `acceptance.<root-domain>`

Do not create SWA custom-domain records until the matching SWA exists.

### 5. Azure Bootstrap

Ask the human to select or create the Azure subscription, then run:

```bash
az account set --subscription "<subscription-id>"
az provider register --namespace Microsoft.Web
az provider register --namespace Microsoft.DocumentDB
az provider register --namespace Microsoft.OperationalInsights
az provider register --namespace Microsoft.Insights
az provider register --namespace Microsoft.ManagedIdentity
```

Create the GitHub Actions deployment app registration and service principal:

```bash
az ad app create --display-name "<new-repo>-github-actions"
az ad sp create --id "<application-client-id>"
az role assignment create \
  --assignee "<application-client-id>" \
  --role Contributor \
  --scope "/subscriptions/<subscription-id>"
```

Add federated credentials for:

```text
repo:<owner>/<new-repo>:environment:acceptance
repo:<owner>/<new-repo>:environment:production
```

Store these values as GitHub environment secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `CIAM_TENANT_ID`
- `CIAM_TENANT_NAME`
- `CIAM_CLIENT_ID`
- `CIAM_CLIENT_SECRET`

### 6. Provision

Dispatch acceptance first:

```bash
gh workflow run "Provision Azure" --ref main -f environment=acceptance
gh run list --workflow "Provision Azure"
```

After acceptance succeeds, dispatch production:

```bash
gh workflow run "Provision Azure" --ref main -f environment=production
```

### 7. DNS Binding

Resolve SWA hostnames:

```bash
az staticwebapp show \
  --resource-group "rg-<app-name>-acc" \
  --name "swa-<app-name>-acc" \
  --query defaultHostname \
  --output tsv

az staticwebapp show \
  --resource-group "rg-<app-name>-prd" \
  --name "swa-<app-name>-prd" \
  --query defaultHostname \
  --output tsv
```

Add custom domains in Azure Static Web Apps, then add the Cloudflare validation
and CNAME records described in `INFRASTRUCTURE.md`.

### 8. Deploy

Deploy acceptance:

```bash
gh workflow run "Deploy Static Web App" --ref main -f environment=acceptance
```

Verify acceptance manually or with browser automation. Deploy production only
after acceptance is verified:

```bash
gh workflow run "Deploy Static Web App" --ref main -f environment=production
```

### 9. Final Checks

Run:

```bash
npm run ci
git status --short
```

Report:

- repo URL
- Azure resource groups
- SWA names and default hostnames
- Cloudflare zone and DNS records
- acceptance URL
- production URL
- checks run and any skipped manual steps
