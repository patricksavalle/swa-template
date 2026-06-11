const apiVersion = "0.1.0";

type SchemaPropertyValue<Property> = Property extends { readonly const: infer Value }
  ? Value
  : Property extends { readonly type: "string" }
    ? string
    : Property extends { readonly type: "boolean" }
      ? boolean
      : Property extends { readonly type: "array"; readonly items: infer Item }
        ? readonly SchemaPropertyValue<Item>[]
        : Property extends { readonly type: "object"; readonly properties: infer Properties extends Record<string, unknown> }
          ? { readonly [Key in keyof Properties]: SchemaPropertyValue<Properties[Key]> }
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

const azureResourceSchema = {
  type: "object",
  additionalProperties: false,
  required: ["kind", "name"],
  properties: {
    kind: {
      type: "string"
    },
    name: {
      type: "string"
    },
    settings: {
      type: "object",
      additionalProperties: {
        oneOf: [
          {
            type: "string"
          },
          {
            type: "array",
            items: {
              type: "string"
            }
          }
        ]
      }
    }
  }
} as const;

const azureResourcesResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["environment", "resources"],
  properties: {
    environment: {
      type: "string"
    },
    resources: {
      type: "array",
      items: azureResourceSchema
    }
  }
} as const;

export type AzureResourcesResponse = ObjectSchemaValue<typeof azureResourcesResponseSchema>;

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
    },
    "/api/resources": {
      get: {
        operationId: "listAzureResources",
        summary: "List Azure resources",
        description: "Returns the Azure resources and external identity configuration used by the app.",
        tags: ["system"],
        responses: {
          "200": {
            description: "The resources used by the app.",
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
                  $ref: "#/components/schemas/AzureResourcesResponse"
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
      AzureResource: azureResourceSchema,
      AzureResourcesResponse: azureResourcesResponseSchema,
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
