import type { HealthResponse } from "../openapi/document.js";

const SERVICE_NAME = "swa-template-api";

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

function getEnvironmentName(): string {
  return process.env.APP_ENV ?? "local";
}

export async function health(context: InvocationContext, request: HttpRequest): Promise<HttpResponse> {
  const startedAt = Date.now();
  const response: HealthResponse = {
    ok: true,
    service: SERVICE_NAME,
    environment: getEnvironmentName(),
    timestamp: new Date().toISOString()
  };

  context.log("health check completed", {
    route: "/api/health",
    method: request.method ?? "GET",
    outcome: "ok",
    durationMs: Date.now() - startedAt
  });

  return {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(response)
  };
}
