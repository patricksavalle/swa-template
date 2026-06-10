import { openApiDocument } from "./document.js";

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

export async function openApi(context: InvocationContext, request: HttpRequest): Promise<HttpResponse> {
  const startedAt = Date.now();

  context.log("openapi document served", {
    route: "/api/openapi.json",
    method: request.method ?? "GET",
    outcome: "ok",
    durationMs: Date.now() - startedAt
  });

  return {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(openApiDocument)
  };
}
