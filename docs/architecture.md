# Architecture

## Intent

This template separates the project into a small number of durable boundaries:

- `html/` for 11ty pages, includes, layouts, and data.
- `css/` for styling.
- `img/` for image and media assets.
- `api/` for optional serverless endpoints.
- `ts/` for TypeScript source.
- `INFRASTRUCTURE.md` for deployable platform and project-structure decisions.
- `tests/` for cross-boundary verification.

## Dependency Direction

Default TypeScript dependency flow:

```text
ts/userinterface  -> ts/businesslogic
ts/userinterface  -> ts/infrastructure
ts/infrastructure -> ts/businesslogic contracts
api               -> ts/businesslogic or ts/infrastructure
tests             -> html/css/ts/api
```

Avoid dependencies from `ts/businesslogic/` into concrete UI, browser, network,
storage, or deployment implementations.

Architecture rules are declared in `eslint.architecture.mjs` files and enforced
by `npm run lint`. Static pages are rendered by 11ty from `html/` to `dist/`.

## Extension Rule

Add a new top-level directory only when it represents a new artifact type with
at least two expected files or modules. One-off files belong in the nearest
existing directory.
