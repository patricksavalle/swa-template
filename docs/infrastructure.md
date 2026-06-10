# Infrastructure

## Purpose

Define the Azure platform for the instantiated project. By default, workflows
derive the project name from the final cloned repository name. Set the GitHub
variable `APP_NAME` to override the derived name.

## Target Shape

| Area | Decision |
| --- | --- |
| Hosting platform | Azure Static Web Apps |
| Frontend artifact | Static bundle from `dist/` |
| API runtime | Optional Azure Static Web Apps API under `api/` |
| Identity model | GitHub OIDC to Azure |
| Environment strategy | Acceptance and production |
| IaC tool | Bicep |
| Secret store | GitHub environment secrets seeded into SWA app settings |
| Observability | Log Analytics and Application Insights |

## Environments

### Acceptance

Production-like environment used for validation. Acceptance deploys the same
artifact shape and resource set as production.

### Production

Promoted from a previously validated artifact. Production deployment requires a
health check and rollback path.

## Resource Inventory

| Resource | Purpose | Owner | Lifecycle | Notes |
| --- | --- | --- | --- | --- |
| Azure Static Web App | Serves frontend and optional API | Azure | Per environment | Name derived from repository or `APP_NAME` |
| Cosmos DB for NoSQL | Application data | Azure | Per environment | Same database/container shape |
| CIAM tenant/app registration | Customer identity | Entra External ID / CIAM | Seed prerequisite | IDs/secrets supplied by GitHub environment |
| Log Analytics | Central telemetry workspace | Azure Monitor | Per environment | 30 days acceptance, 90 days production |
| Application Insights | App telemetry | Azure Monitor | Per environment | Workspace-based |
| User-assigned managed identity | Future Azure resource access | Azure | Per environment | Provisioned with resources |

## Deployment Principles

- Build once and promote the same artifact.
- Inject environment-specific configuration at deploy time.
- Use idempotent IaC or create-or-update commands.
- Use GitHub OIDC for Azure login.
- Validate configuration before deployment.
- Health-check after deployment.
- Roll back by redeploying a known-good artifact.

## Required CI/CD Variables

Use repository or environment variables for non-secret identifiers.

| Name | Purpose |
| --- | --- |
| `AZURE_CLIENT_ID` | Federated deployment identity client ID |
| `AZURE_TENANT_ID` | Azure tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `CIAM_TENANT_ID` | CIAM tenant ID |
| `CIAM_TENANT_NAME` | CIAM tenant name |
| `CIAM_CLIENT_ID` | CIAM application client ID |
| `CIAM_CLIENT_SECRET` | CIAM application client secret |

These are GitHub environment secrets in `acceptance` and `production`. No Key
Vault is used by this template.

## Static Web App Locations

The template uses SWA-recognizable defaults:

| Setting | Value | Purpose |
| --- | --- | --- |
| `app_location` | `.` | Repository root is the build context. |
| `api_location` | `api` | Optional serverless API source. |
| `output_location` | `dist` | Static artifact produced by CI. |

The source directories are intentionally flatter than many framework templates:
`html/`, `css/`, `img/`, and `ts/` build into `dist/`.

## Open Decisions

- API runtime and deployment unit.
- Domain, DNS, and certificate ownership.
- Monitoring and alert thresholds.
