import type { AzureResourcesResponse } from "../openapi/document.js";

interface HttpRequest {
  readonly method?: string;
}

interface InvocationContext {
  readonly log: (...messages: unknown[]) => void;
}

interface HttpResponse {
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly body: string;
}

function readSetting(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

function readListSetting(name: string): readonly string[] {
  return readSetting(name)
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function readConfiguredStatus(name: string): string {
  return readSetting(name).length > 0 ? "configured" : "missing";
}

export async function resources(context: InvocationContext, request: HttpRequest): Promise<HttpResponse> {
  const startedAt = Date.now();
  const cosmosContainerNames = readListSetting("COSMOS_CONTAINER_NAMES");
  const response: AzureResourcesResponse = {
    environment: readSetting("APP_ENV", "local"),
    resources: [
      {
        kind: "Azure Static Web App",
        name: readConfiguredStatus("STATIC_WEB_APP_NAME"),
        settings: {
          projectName: readSetting("PROJECT_NAME"),
          environment: readSetting("APP_ENV", "local")
        }
      },
      {
        kind: "Azure Cosmos DB for NoSQL",
        name: readConfiguredStatus("COSMOS_ACCOUNT_NAME"),
        settings: {
          endpointStatus: readConfiguredStatus("COSMOS_ENDPOINT"),
          databaseStatus: readConfiguredStatus("COSMOS_DATABASE_NAME"),
          containerCount: String(cosmosContainerNames.length)
        }
      },
      {
        kind: "Log Analytics workspace",
        name: readConfiguredStatus("LOG_ANALYTICS_WORKSPACE_NAME"),
        settings: {}
      },
      {
        kind: "Application Insights",
        name: readConfiguredStatus("APPLICATION_INSIGHTS_NAME"),
        settings: {
          connectionStatus: readConfiguredStatus("APPLICATIONINSIGHTS_CONNECTION_STRING")
        }
      },
      {
        kind: "CIAM / Entra External ID app registration",
        name: readConfiguredStatus("CIAM_CLIENT_ID"),
        settings: {
          clientStatus: readConfiguredStatus("CIAM_CLIENT_ID"),
          tenantStatus: readConfiguredStatus("CIAM_TENANT_ID")
        }
      }
    ]
  };

  context.log("azure resources listed", {
    route: "/api/resources",
    method: request.method ?? "GET",
    outcome: "ok",
    resourceCount: response.resources.length,
    durationMs: Date.now() - startedAt
  });

  return {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(response)
  };
}
