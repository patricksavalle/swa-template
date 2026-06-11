# Azure Infrastructure

Azure-specific infrastructure for the template.

After cloning the template, the GitHub workflows derive Azure resource names
from the final repository name by default. Set `APP_NAME` as a GitHub variable
to override that default.

## Environments

- `acceptance`
- `production`

Each environment provisions the same resource shape:

- Azure Static Web App
- Azure Cosmos DB for NoSQL
- Log Analytics workspace
- Application Insights
- CIAM configuration as application settings

CIAM tenant and app registration creation are treated as seed prerequisites.
They are not created by Bicep because tenant/app-registration lifecycle is not
an idempotent resource-group deployment concern.
