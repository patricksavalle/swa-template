---
name: technical-design
description:
    Use this skill when documenting, reviewing, or verifying the implemented
    design of a Static Web App, 11ty, TypeScript, JavaScript, or serverless
    project: module roles, data flow, dependency direction, runtime boundaries,
    API handlers, storage, and UI integration.
---

# Technical Design

> **Out of scope:** First-principles architecture decisions live in
> `architecture-guidelines`. Placement and dependency coordinates live in
> `geometric-architecture`. Executable dependency rules live in
> `architecture-as-code-javascript`.

> **Core Directives**
>
> 1. **Describe the implemented system.** Record how the project is wired now,
>    not an aspirational architecture.
> 2. **Name every boundary.** UI, domain, infrastructure, API, persistence, and
>    build-time code MUST have explicit responsibilities.
> 3. **Trace data end to end.** Every design note MUST explain source,
>    transformation, storage, error path, and consumer.
> 4. **Keep domain logic portable.** Deterministic business rules MUST stay free
>    of browser, serverless, filesystem, network, and cloud SDK dependencies.
> 5. **Verify against code.** Update this skill only after reading exports and
>    nearest callers; never infer structure from folder names alone.

---

## 1. Design Record Scope

Use this skill to capture the project's concrete technical design:

| Concern | Required record |
| --- | --- |
| **Stack** | SSG/runtime, TypeScript mode, API host, storage, deploy target |
| **Modules** | Public exports, ownership, allowed callers, forbidden dependencies |
| **Data flow** | Input source, validation, transformation, persistence, output |
| **State** | Owner, lifetime, serialization format, cache invalidation |
| **Events** | Producer, event name/type, payload, consumer, failure handling |
| **API** | Route, auth boundary, validation, idempotency, response contract |
| **Build** | Generated files, artifact paths, environment injection points |

## 2. Stack Boundaries

Document the stack in layers. Do not merge layers because one file currently
touches two concerns; record the violation and route the fix through
`design-and-refactor`.

| Layer | Owns | Must not own |
| --- | --- | --- |
| **Build-time** | Static rendering, content transforms, asset generation | Browser-only state, runtime secrets |
| **User interface** | DOM events, rendering hooks, browser interaction | Durable business decisions, direct cloud SDK calls |
| **Domain** | Pure rules, calculations, validation decisions | DOM, `window`, `document`, `process.env`, network, storage |
| **Infrastructure** | Config loading, adapters, SDK clients, persistence | UI state, domain policy |
| **API** | HTTP boundary, auth/authorization, request validation, response mapping | Browser UI, build scripts |
| **Scripts** | Build, migration, validation, release automation | Runtime imports from app code unless explicitly documented |

## 3. Dependency Direction

Default direction:

```text
UI -> Domain
API -> Domain
Infrastructure -> Domain
Composition root -> UI + API + Infrastructure + Domain
Scripts -> build/validation targets only
```

Rules:

- Domain MAY expose pure types and functions to every runtime layer.
- UI MAY call domain functions but MUST NOT import infrastructure adapters.
- API MAY call domain functions and infrastructure adapters.
- Infrastructure MAY depend on domain types but MUST NOT depend on UI or API
  entrypoints.
- Composition roots MAY wire concrete implementations; ordinary modules MUST
  NOT create cross-layer singletons.

## 4. Data Flow Trace

Every non-trivial feature design MUST include this trace:

```text
source -> validation -> domain decision -> persistence/cache -> projection -> consumer
```

Record for each step:

| Step | Questions |
| --- | --- |
| **Source** | Which user action, job, webhook, file, or API request creates data? |
| **Validation** | What rejects malformed, unauthorized, or impossible input first? |
| **Domain decision** | Which pure module decides meaning or outcome? |
| **Persistence/cache** | What is stored, what is derived, and what is discarded? |
| **Projection** | What shape is exposed to UI, API response, or downstream job? |
| **Consumer** | Which component, endpoint, script, or external system reads it? |

## 5. Serverless API Constraints

Serverless handlers MUST be cold-start safe.

- Instantiate SDK clients at module scope when reuse is safe.
- Keep request-specific state inside the handler scope.
- Read config through environment variables or injected config objects.
- Validate request input before domain execution.
- Return deterministic status codes and error bodies.
- Make idempotent operations explicitly idempotent: success when the desired
  state is already true, failure when the desired state cannot be reached.

## 6. UI Integration

UI design records MUST distinguish static structure from runtime enhancement.

| Pattern | Use when | Constraint |
| --- | --- | --- |
| **Static markup** | Content and primary structure are known at build time | Runtime JS only enhances |
| **Custom element** | A reusable browser behavior owns lifecycle | Cleanup in `disconnectedCallback` |
| **Event bridge** | Services or stores notify UI without direct imports | Event names and payloads documented |
| **Progressive enhancement** | Page works before JS loads | JS MUST NOT be the only path to content |

Runtime DOM code MUST sanitize untrusted content and avoid string-built HTML.

## 7. Storage And State

State records MUST name one owner.

| State type | Owner record |
| --- | --- |
| **Durable source of truth** | Storage system, schema, migration path |
| **Session cache** | Invalidation trigger and recomputation source |
| **Derived value** | Source fields and recalculation rule |
| **Secret/config** | Injection point, rotation path, non-commit guarantee |
| **External state** | Provider, consistency model, retry/error contract |

Never persist derived values unless the design records why recomputation is too
expensive or impossible.

## 8. Review Checklist

Before claiming the technical design is accurate:

- [ ] Read the module exports and at least two nearest callers.
- [ ] Confirm dependency direction matches `eslint.architecture.mjs`.
- [ ] Trace one happy path and one failure path end to end.
- [ ] Confirm generated files and build outputs are not treated as source.
- [ ] Confirm secrets and environment-specific values enter at deploy/runtime,
      not static build output.
- [ ] Update the design record when code reality changes.
