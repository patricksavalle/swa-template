const apiVersion = "0.1.0";

type SchemaPropertyValue<Property> = Property extends { readonly const: infer Value }
  ? Value
  : Property extends { readonly type: "string" }
    ? string
    : Property extends { readonly type: "boolean" }
      ? boolean
      : unknown;

type ObjectSchemaValue<Schema extends { readonly properties: Record<string, unknown> }> = {
  readonly [Key in keyof Schema["properties"]]: SchemaPropertyValue<Schema["properties"][Key]>;
};

const healthResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "service", "environment", "timestamp"],
  properties: {
    ok: {
      type: "boolean",
      const: true
    },
    service: {
      type: "string"
    },
    environment: {
      type: "string"
    },
    timestamp: {
      type: "string",
      format: "date-time"
    }
  }
} as const;

export type HealthResponse = ObjectSchemaValue<typeof healthResponseSchema>;

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "swa-template API",
    version: apiVersion,
    description: "Optional Azure Static Web Apps serverless API boundary."
  },
  paths: {
    "/api/health": {
      get: {
        operationId: "getHealth",
        summary: "Read API health",
        description: "Returns a no-store health response with environment context.",
        tags: ["system"],
        responses: {
          "200": {
            description: "The API is healthy.",
            headers: {
              "Cache-Control": {
                schema: {
                  type: "string",
                  const: "no-store"
                }
              }
            },
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/openapi.json": {
      get: {
        operationId: "getOpenApiDocument",
        summary: "Read OpenAPI document",
        description: "Returns the source-owned OpenAPI contract for this API.",
        tags: ["system"],
        responses: {
          "200": {
            description: "The OpenAPI document.",
            content: {
              "application/json": {
                schema: {
                  type: "object"
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      HealthResponse: healthResponseSchema
    }
  },
  tags: [
    {
      name: "system",
      description: "Operational endpoints."
    }
  ]
} as const;
