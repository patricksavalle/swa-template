# Infrastructure

This file is the human-facing contract for the template's Azure infrastructure
and project structure. It records decisions, prerequisites, naming rules, and
operational expectations that cannot be safely inferred from Bicep, workflow
YAML, or source directories alone.

---

## Infrastructure Hierarchy

```text
Azure tenant / subscription
└── Resource group: rg-<app-name>-<env-suffix>
    ├── Azure Static Web App: swa-<app-name>-<env-suffix>
    │   ├── Static artifact: dist/
    │   ├── Optional API source: api/
    │   └── App settings seeded by GitHub workflows
    ├── Cosmos DB for NoSQL: cosmos-<app-name>-<env-suffix>
    │   └── SQL database: app
    ├── Log Analytics workspace: law-<app-name>-<env-suffix>
    ├── Application Insights: appi-<app-name>-<env-suffix>
    └── User-assigned managed identity: id-<app-name>-<env-suffix>

External prerequisite
└── CIAM / Entra External ID tenant and app registration
    └── Values supplied through GitHub environment secrets
```

`<app-name>` is derived from the final cloned repository name unless the GitHub
variable `APP_NAME` is set. The derived value is lowercased and sanitized to
letters, numbers, and hyphens.

Environment suffixes:

| Environment | Suffix | Resource group pattern |
| --- | --- | --- |
| Acceptance | `acc` | `rg-<app-name>-acc` |
| Production | `prd` | `rg-<app-name>-prd` |

---

## Project Structure

```text
.
├── .agents/skills/                 Agent skills committed with the template
├── .github/workflows/              CI, provision, seed, and deploy workflows
├── api/                            Optional SWA API / Azure Functions boundary
├── css/                            Static styles copied by 11ty
├── docs/                           Supporting decisions and topic docs
├── html/                           11ty input directory
├── img/                            Static image assets copied by 11ty
├── infrastructure/                 Bicep and environment parameter files
├── scripts/                        Local validation and build helpers
├── tests/                          Cross-boundary tests
├── ts/
│   ├── businesslogic/              Deterministic app/domain decisions
│   ├── infrastructure/             Runtime/platform adapters
│   └── userinterface/              Browser UI entrypoints and flows
├── INFRASTRUCTURE.md               This document
├── eleventy.config.js              11ty build configuration
├── eslint.architecture.mjs         Root architecture dependency rules
├── staticwebapp.config.json        Azure Static Web Apps runtime config
├── swa-cli.config.json             SWA CLI local configuration
└── tsconfig.json                   TypeScript compiler configuration
```

The project intentionally keeps web source folders flat (`html`, `css`, `img`,
`ts`) so a cloned repository is understandable before a framework is chosen.

### Build Artifact

The deployable artifact is always `dist/`.

Build sequence:

1. `scripts/clean-dist.mjs` removes and recreates `dist/`.
2. 11ty renders `html/` into `dist/`.
3. 11ty copies `css/site.css`, supported image assets, and
   `staticwebapp.config.json` into `dist/`.
4. TypeScript compiles `ts/` into `dist/ts/`.

SWA locations:

| SWA setting | Value | Meaning |
| --- | --- | --- |
| `app_location` | `dist` during deploy | Prebuilt static artifact |
| `api_location` | `api` | Optional API source |
| `output_location` | empty during deploy | Build already happened in CI |

Local SWA CLI config keeps `appLocation` as `.` because it runs the configured
build command before serving.

---

## Environments

### Acceptance

Acceptance is the production-like validation environment. It has the same
resource classes as production and uses its own resource group, Cosmos account,
telemetry resources, and seeded application settings.

Use acceptance for:

- validating infrastructure changes before production
- validating CIAM and application setting changes
- validating SWA deploys from the prebuilt artifact
- manual smoke testing after API or infrastructure changes

### Production

Production has the same resource shape as acceptance. Differences are limited
to environment suffix, Static Web App SKU, and telemetry retention.

Production deployment should happen only after the same commit has passed CI
and the acceptance environment has been verified.

---

## Azure Resources

The Bicep deployment in `infrastructure/main.bicep` provisions the Azure
resources below per environment.

| Resource | Naming pattern | Purpose |
| --- | --- | --- |
| Resource group | `rg-<app-name>-<env>` | Environment boundary |
| Static Web App | `swa-<app-name>-<env>` | Hosts `dist/` and optional API |
| Cosmos DB account | `cosmos-<app-name>-<env>` | NoSQL data store |
| Cosmos SQL database | `app` by default | Application database |
| Cosmos containers | parameterized | Application collections |
| Log Analytics | `law-<app-name>-<env>` | Telemetry workspace |
| Application Insights | `appi-<app-name>-<env>` | App telemetry |
| Managed identity | `id-<app-name>-<env>` | Future Azure resource access |

The CIAM tenant and app registration are external seed prerequisites. They are
not created by Bicep because tenant/app-registration lifecycle is not a normal
idempotent resource-group deployment concern.

---

## GitHub Environments

Create two GitHub environments:

- `acceptance`
- `production`

Each environment stores the values used by workflows for that environment.

### Required Secrets

| Secret | Purpose |
| --- | --- |
| `AZURE_CLIENT_ID` | Federated Azure deployment identity client ID |
| `AZURE_TENANT_ID` | Azure tenant ID for OIDC login |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `CIAM_TENANT_ID` | External identity tenant ID |
| `CIAM_TENANT_NAME` | External identity tenant name |
| `CIAM_CLIENT_ID` | External identity app registration client ID |
| `CIAM_CLIENT_SECRET` | External identity app registration client secret |

### Optional Variables

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | Overrides the repository-derived Azure name prefix |

No Key Vault is used in this template. Seed secrets live in GitHub
environments and are written into Azure Static Web App application settings by
workflow. Cosmos connection strings are read from Azure during workflow
execution and seeded into SWA app settings; they are not stored as GitHub
secrets.

---

## GitHub Workflows

| Workflow | Purpose |
| --- | --- |
| `ci.yml` | Validates structure, lint, typecheck, 11ty build, and tests |
| `provision-azure.yml` | Creates or updates acceptance/production Azure resources |
| `seed-azure-app-settings.yml` | Reapplies CIAM and Cosmos app settings |
| `deploy-static-web-app.yml` | Builds once and deploys the prebuilt `dist/` artifact |

### Provisioning Flow

Manual dispatch:

1. Choose `acceptance` or `production`.
2. Workflow derives `app_name` from `APP_NAME` or repository name.
3. Workflow creates the target resource group.
4. Workflow deploys `infrastructure/main.bicep` with the matching
   `.bicepparam` file.
5. Workflow reads the Cosmos connection string from Azure.
6. Workflow seeds CIAM and Cosmos values into SWA app settings.

### Deployment Flow

Manual dispatch:

1. CI builds the immutable `dist/` artifact.
2. Deploy job logs into Azure with OIDC.
3. Deploy job reads the target SWA deployment token from Azure.
4. `Azure/static-web-apps-deploy@v1` uploads the prebuilt artifact with
   `skip_app_build: true` and `skip_api_build: true`.

The deploy platform must not rebuild the app. CI is the build authority.

---

## Seed Settings

The following app settings are written by Bicep or seed workflows:

| Setting | Source | Notes |
| --- | --- | --- |
| `APP_ENV` | Bicep | `acceptance` or `production` |
| `PROJECT_NAME` | Bicep/workflow parameter | Derived from repo or `APP_NAME` |
| `CIAM_TENANT_ID` | GitHub environment secret | Non-secret identifier but stored with seed bundle |
| `CIAM_TENANT_NAME` | GitHub environment secret | Non-secret identifier but stored with seed bundle |
| `CIAM_CLIENT_ID` | GitHub environment secret | Non-secret identifier but stored with seed bundle |
| `CIAM_CLIENT_SECRET` | GitHub environment secret | Secret |
| `COSMOS_ACCOUNT_NAME` | Bicep | Derived resource name |
| `COSMOS_ENDPOINT` | Bicep | Cosmos endpoint |
| `COSMOS_DATABASE_NAME` | Bicep | Defaults to `app` |
| `COSMOS_CONNECTION_STRING` | Azure CLI during workflow | Secret read from Azure |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Bicep | App telemetry connection string |

Re-run `Seed Azure App Settings` after rotating CIAM credentials or regenerating
Cosmos keys.

---

## Architecture Rules

Architecture is enforced through `eslint.architecture.mjs` files and
`eslint-plugin-boundaries`.

Root rule intent:

- business logic must not import UI, API, or concrete infrastructure
  implementations
- infrastructure must not import UI or API entrypoints
- API code must not import browser UI code
- runtime code must not import build/release scripts

Tier-local architecture files live under:

```text
ts/businesslogic/eslint.architecture.mjs
ts/infrastructure/eslint.architecture.mjs
ts/userinterface/eslint.architecture.mjs
```

When adding a new tier or module, add or update architecture rules before
implementation code.

---

## DNS And Custom Domains

DNS is intentionally not provisioned by this template.

For a real project, record externally managed DNS here after instantiation:

| Name | Type | Target | Environment |
| --- | --- | --- | --- |
| TBD | CNAME/TXT | TBD | acceptance |
| TBD | CNAME/TXT | TBD | production |

Azure Static Web Apps custom domain validation usually requires DNS records
created outside this repository. Keep those records in this document after the
project is instantiated, because they cannot be inferred from Bicep unless DNS
is later brought under IaC.

---

## Telemetry

Application telemetry is workspace-based:

- Log Analytics receives platform and application telemetry.
- Application Insights is linked to the workspace.
- The Application Insights connection string is exposed to the app through SWA
  app settings.

The template does not define alert rules or dashboards yet. Add them as Bicep
modules when thresholds and ownership are known.

---

## Security Decisions

- Azure login uses GitHub OIDC, not a long-lived Azure deployment secret.
- CIAM client secret is a seed secret because external identity app
  registration lifecycle is outside the Bicep deployment.
- No Key Vault is used.
- Build happens in CI; SWA receives a prebuilt artifact.
- Runtime app settings are environment-scoped.
- Production should have GitHub environment protection rules before use.

---

## Manual Verification

Run these checks after provisioning or changing infrastructure.

### Acceptance

- [ ] `Provision Azure` completes for `acceptance`.
- [ ] `Seed Azure App Settings` completes for `acceptance`.
- [ ] `Deploy Static Web App` completes for `acceptance`.
- [ ] SWA default hostname serves `dist/index.html`.
- [ ] App settings contain CIAM values and Cosmos connection string.
- [ ] Cosmos database and expected containers exist.
- [ ] Application Insights receives at least one test telemetry event after the
      app is wired to emit telemetry.

### Production

- [ ] Acceptance was verified for the same commit.
- [ ] `Provision Azure` completes for `production`.
- [ ] `Seed Azure App Settings` completes for `production`.
- [ ] `Deploy Static Web App` completes for `production`.
- [ ] Production GitHub environment has required reviewers or equivalent
      protection.
- [ ] Custom domain and DNS validation records are documented after binding.

---

## Known Limitations

1. CIAM tenant and app registration are external prerequisites.
2. No Key Vault is used; seed secrets are stored in GitHub environments.
3. DNS/custom domains are documented manually unless the instantiated project
   adds DNS IaC.
4. Alert rules, dashboards, and SLO thresholds are not included until the
   instantiated project defines ownership and thresholds.
5. The optional `api/` boundary is present, but no concrete API runtime is
   selected by the template.

---

## References

- `README.md`
- `.github/workflows/ci.yml`
- `.github/workflows/provision-azure.yml`
- `.github/workflows/seed-azure-app-settings.yml`
- `.github/workflows/deploy-static-web-app.yml`
- `infrastructure/main.bicep`
- `infrastructure/environments/acceptance.bicepparam`
- `infrastructure/environments/production.bicepparam`
- `docs/seed-secrets.md`
- `docs/linting.md`
