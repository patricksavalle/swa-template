# 0001. Template Boundaries

## Status

Accepted

## Context

The template must be useful for a new Static Web App project without carrying
business code, framework lock-in, or project-specific infrastructure.

## Decision

Use a flat, generic structure with durable boundaries:

- `app/`
- `api/`
- `packages/`
- `infrastructure/`
- `tests/`
- `docs/`
- `scripts/`

Provider-specific infrastructure and framework-specific application code are
added only after the target project chooses them.

## Consequences

- The template is immediately cloneable.
- CI can validate the project before real app code exists.
- Projects must make explicit runtime and infrastructure decisions before
  implementation.
