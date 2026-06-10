# Architecture

## Intent

This template separates the project into a small number of durable boundaries:

- `app/` for browser-facing user experience.
- `api/` for server-side boundaries.
- `packages/` for shared code with multiple proven consumers.
- `infrastructure/` for deployable platform state.
- `tests/` for cross-boundary verification.

## Dependency Direction

Default dependency flow:

```text
app  -> packages
api  -> packages
tests -> app/api/packages
infrastructure -> deployable artifacts
```

Avoid dependencies from `packages/` back into `app/` or `api/`.

## Extension Rule

Add a new top-level directory only when it represents a new artifact type with
at least two expected files or modules. One-off files belong in the nearest
existing directory.
