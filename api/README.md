# API

Optional Azure Functions API boundary.

The template includes:

- a TypeScript health endpoint in `src/health/index.ts`
- a source-owned OpenAPI 3.1 document in `src/openapi/document.ts`
- an OpenAPI JSON endpoint in `src/openapi/index.ts`

The root build compiles API source into `dist/`.
`npm run validate` checks that Azure Function routes and the OpenAPI paths stay
in sync before the later build and test stages run.

Static-only projects can leave the GitHub variable `SWA_API_LOCATION` unset.
Set `SWA_API_LOCATION=api` only when the project should deploy this TypeScript
Azure Functions API boundary.

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
| `GET` | `/api/openapi.json` | Returns the OpenAPI document for the serverless API. |
