# API

Standard Azure Functions API boundary.

The template includes:

- a TypeScript health endpoint in `src/health/index.ts`
- a TypeScript Azure resources endpoint in `src/resources/index.ts`
- a source-owned OpenAPI 3.1 document in `src/openapi/document.ts`
- an OpenAPI JSON endpoint in `src/openapi/index.ts`

The root build compiles API source into `dist/`.
`npm run validate` checks that Azure Function routes and the OpenAPI paths stay
in sync before the later build and test stages run.

SWA location:

```text
api_location: api
```

Build command:

```text
npm run build:api
```

Default endpoints:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Returns no-store API health and environment context. |
| `GET` | `/api/resources` | Returns the Azure resources and external identity configuration used by the app. |
| `GET` | `/api/openapi.json` | Returns the OpenAPI document for the serverless API. |
