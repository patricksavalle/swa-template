# Azure Infrastructure

Azure-specific infrastructure for the template.

The example project name is `l-gevity`. After cloning the template, override
`projectName` and `resourceNamePrefix` in the environment parameter files.

## Environments

- `acceptance`
- `production`

Each environment provisions the same resource shape:

- Azure Static Web App
- Azure Cosmos DB for NoSQL
- Log Analytics workspace
- Application Insights
- User-assigned managed identity
- CIAM configuration as application settings

CIAM tenant and app registration creation are treated as seed prerequisites.
They are not created by Bicep because tenant/app-registration lifecycle is not
an idempotent resource-group deployment concern.
