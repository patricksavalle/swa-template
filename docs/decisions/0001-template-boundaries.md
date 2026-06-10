# 0001. Template Boundaries

## Status

Accepted

## Context

The template must be useful for a new Static Web App project without carrying
business code, framework lock-in, or project-specific infrastructure.

## Decision

Use a flat, generic structure with durable boundaries:

- `html/`
- `css/`
- `img/`
- `ts/infrastructure/`
- `ts/businesslogic/`
- `ts/userinterface/`
- `tests/`
- `docs/`
- `scripts/`

Agent skills are committed under `.agents/skills/` so the repository is ready
to clone and use with compatible agents.

Provider-specific infrastructure and framework-specific application code are
added only after the target project chooses them.

## Consequences

- The template is immediately cloneable.
- CI can validate the project before real app code exists.
- Projects must make explicit runtime and infrastructure decisions before
  implementation.
