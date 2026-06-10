# Infrastructure

## Purpose

Define the deployable platform for this project without binding the template to
a specific cloud account, subscription, tenant, region, or application domain.

This document should be completed before provider-specific IaC is added.

## Target Shape

| Area | Decision |
| --- | --- |
| Hosting platform | TBD |
| Frontend artifact | Static bundle from `dist/` |
| API runtime | TBD |
| Identity model | OIDC / federated identity preferred |
| Environment strategy | Preview, staging, production |
| IaC tool | TBD |
| Secret store | TBD |
| Observability | TBD |

## Environments

### Preview

Created per pull request or feature branch. Preview deployments validate the
artifact before promotion and should be safe to create repeatedly.

### Staging

Production-like environment used for final validation. Staging should deploy
the same immutable artifact that may later be promoted to production.

### Production

Promoted from a previously validated artifact. Production deployment requires a
health check and rollback path.

## Resource Inventory

Replace this table with concrete resources once the cloud provider is chosen.

| Resource | Purpose | Owner | Lifecycle | Notes |
| --- | --- | --- | --- | --- |
| Static web host | Serves frontend artifact | TBD | Per environment | TBD |
| API host | Runs backend boundary | TBD | Per environment | TBD |
| Identity principal | CI/CD deployment identity | TBD | Shared or per env | Prefer OIDC |
| Secret store | Runtime secrets | TBD | Per environment | No secrets in repo |
| Monitoring | Health, logs, alerts | TBD | Per environment | Required before production |

## Deployment Principles

- Build once and promote the same artifact.
- Inject environment-specific configuration at deploy time.
- Use idempotent IaC or create-or-update commands.
- Prefer OIDC over long-lived deployment credentials.
- Validate configuration before deployment.
- Health-check after deployment.
- Roll back by redeploying a known-good artifact.

## Required CI/CD Variables

Use repository or environment variables for non-secret identifiers.

| Name | Purpose |
| --- | --- |
| `AZURE_CLIENT_ID` | Federated deployment identity client ID, if Azure is used |
| `AZURE_TENANT_ID` | Azure tenant ID, if Azure is used |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID, if Azure is used |
| `SWA_NAME` | Static web app resource name |
| `RESOURCE_GROUP` | Resource group or equivalent deployment scope |

Use secrets only where the target platform cannot use federated identity.

## Open Decisions

- Cloud provider and region.
- Frontend framework and build output path.
- API runtime and deployment unit.
- IaC tool.
- Domain, DNS, and certificate ownership.
- Monitoring and alert thresholds.
