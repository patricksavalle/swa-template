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

export async function resources(context: InvocationContext, request: HttpRequest): Promise<HttpResponse> {
  const startedAt = Date.now();
  const response: AzureResourcesResponse = {
    environment: readSetting("APP_ENV", "local"),
    resources: [
      {
        kind: "Azure Static Web App",
        name: readSetting("STATIC_WEB_APP_NAME"),
        settings: {
          projectName: readSetting("PROJECT_NAME")
        }
      },
      {
        kind: "Azure Cosmos DB for NoSQL",
        name: readSetting("COSMOS_ACCOUNT_NAME"),
        settings: {
          endpoint: readSetting("COSMOS_ENDPOINT"),
          databaseName: readSetting("COSMOS_DATABASE_NAME"),
          containerNames: readListSetting("COSMOS_CONTAINER_NAMES")
        }
      },
      {
        kind: "Log Analytics workspace",
        name: readSetting("LOG_ANALYTICS_WORKSPACE_NAME"),
        settings: {}
      },
      {
        kind: "Application Insights",
        name: readSetting("APPLICATION_INSIGHTS_NAME"),
        settings: {}
      },
      {
        kind: "CIAM / Entra External ID app registration",
        name: readSetting("CIAM_CLIENT_ID"),
        settings: {
          tenantId: readSetting("CIAM_TENANT_ID"),
          tenantName: readSetting("CIAM_TENANT_NAME")
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
