---
name: rest-api-review
description:
    Review, design, or rewrite REST/OpenAPI contracts against a high-quality
    REST API standard. Use when checking API quality, least-surprise resource
    design, endpoint minimality, status codes, errors, pagination, async jobs,
    webhooks, security, compatibility, or OpenAPI contract quality.
---

# REST API Review

Use this skill to design or review HTTP JSON APIs for regularity, least
surprise, minimality, and industry-standard behavior.

## Review Workflow

1. Identify consumer use cases and domain resources.
2. Remove unnecessary aliases, UI-shaped routes, and one-off helper endpoints.
3. Verify URL regularity:
    - major version prefix, except `/health`
    - plural resource nouns
    - lowercase kebab-case literal segments
    - lowerCamelCase path parameters
    - no key-type segments such as `/orderid/{id}`
    - no imperative actions such as `/cancel`
4. Verify method semantics:
    - `GET` reads only
    - `POST` creates resources or starts operations
    - `PUT` replaces complete resources
    - `PATCH` declares JSON Merge Patch or JSON Patch
    - `DELETE` is idempotent
5. Verify response behavior:
    - small standard status-code set
    - `201` includes `Location`
    - `202` includes operation `Location`
    - all `4xx` and `5xx` responses use Problem Details
6. Verify collections:
    - bounded pagination
    - cursor token for mutable or large collections
    - documented sorting, filtering, and sparse fieldsets
7. Verify safety:
    - `ETag` and `If-Match` for lost-update risk
    - `Idempotency-Key` for duplicate-sensitive writes
    - explicit `Cache-Control`
8. Verify security:
    - HTTPS assumption
    - OAuth/OIDC or bearer token scheme
    - scopes per operation
    - no secrets or personal data in URLs
    - CORS only when browser access is required
9. Verify async and webhooks:
    - long-running work is a job resource
    - polling returns `200` job state, not `102`
    - webhooks are registered, signed, replay-protected, retryable, and
      idempotent
10. Verify compatibility:

- additive response changes only for compatible releases
- breaking changes require a new major URL version
- deprecated endpoints declare removal policy

## Minimal Standard Set

Use these status codes unless a stronger local standard narrows them further:

| Code  | Use                                                                    |
| ----- | ---------------------------------------------------------------------- |
| `200` | Successful read, update with body, or action result.                   |
| `201` | New resource created; include `Location`.                              |
| `202` | Work accepted but not complete; include operation `Location`.          |
| `204` | Success with no response body.                                         |
| `304` | Conditional `GET` matched cached representation.                       |
| `400` | Malformed syntax, invalid parameter shape, or missing required header. |
| `401` | Missing, expired, or invalid authentication.                           |
| `403` | Authenticated principal lacks permission.                              |
| `404` | Route/resource not found, or existence must not be revealed.           |
| `405` | Path exists but method is unsupported.                                 |
| `409` | Domain/state conflict.                                                 |
| `412` | `If-Match` or another precondition failed.                             |
| `415` | Unsupported request media type.                                        |
| `422` | Syntactically valid but semantically invalid request.                  |
| `429` | Rate limit exceeded.                                                   |
| `500` | Unexpected server failure.                                             |
| `503` | Temporary service or dependency outage.                                |

## Output

For reviews, lead with findings ordered by severity and include exact OpenAPI
paths or operation IDs. Then list missing enforcement or contract gaps.

For designs, output:

1. resource model
2. endpoint table
3. required schemas
4. status-code and error policy
5. pagination/concurrency/async/security notes
6. minimal OpenAPI skeleton if requested
