# Seed Secrets

No Key Vault is used in this template.

Seed secrets live in GitHub Environments and are pushed into Azure Static Web
App application settings by workflow.

## GitHub Environments

Create two GitHub environments:

- `acceptance`
- `production`

Each environment needs these secrets:

| Secret | Purpose |
| --- | --- |
| `AZURE_CLIENT_ID` | Federated deployment identity client id. |
| `AZURE_TENANT_ID` | Azure tenant id used by GitHub OIDC login. |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription id. |
| `CIAM_TENANT_ID` | CIAM tenant id. |
| `CIAM_TENANT_NAME` | CIAM tenant name. |
| `CIAM_CLIENT_ID` | CIAM application client id. |
| `CIAM_CLIENT_SECRET` | CIAM application client secret. |

The workflows also derive the Cosmos DB connection string from Azure after
provisioning and store it as a Static Web App application setting. It is not
stored as a GitHub secret.

## Rotation

1. Rotate the secret at the source, for example in the CIAM app registration.
2. Update the GitHub environment secret.
3. Run `Seed Azure App Settings` for the same environment.
4. Verify the Static Web App health check.
