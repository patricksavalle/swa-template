# API

Optional Azure Functions API boundary.

The template includes a TypeScript health endpoint in `src/health/index.ts`.
The root build compiles it into `dist/health/index.js`.

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
