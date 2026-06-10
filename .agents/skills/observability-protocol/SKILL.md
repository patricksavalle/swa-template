---
name: observability-protocol
description:
    Conventions for structured logging, request correlation, and metric
    emission in Azure Functions APIs and browser UI code paths. Pins log shape,
    span/attribute names, PII rules, and OpenTelemetry wiring so a future
    analytics swap is mechanical. Use when adding or auditing log lines in
    `api/`, wiring a new Function entry point, diagnosing a slow request, or
    introducing a dependency that needs tracing.
---

# Observability Protocol

How logs, traces, and metrics are produced and labelled. The default
destination is Application Insights; the contract here keeps call sites stable
if the project later changes telemetry backends.

> [!IMPORTANT] This skill governs **shape and discipline**, not infrastructure
> topology. Connection strings, ingestion endpoints, retention, and alert routes
> live in `INFRASTRUCTURE.md`. Do not duplicate them here.

> **TL;DR / Core Directives**
>
> 1. **Structured logs only.** Emit JSON via the project logger. `console.*` is
>    reserved for browser code and build scripts; in `api/` it is a review
>    reject.
> 2. **Every request log carries `traceId` + `spanId`.** Correlation is the
>    point. If you cannot bind a request to a trace, log closer to the request
>    boundary.
> 3. **No PII or secret material in log bodies.** Hash user identity through the
>    project pseudonymization helper before the value crosses the logger.
> 4. **One field name per concept across the whole repo.** See section 3.
> 5. **Use a flush-safe span processor in Functions.** Serverless runtimes may
>    freeze before a batch processor flushes.

---

## 1. When to use this skill

- Adding any `log.*` call inside `api/`.
- Wiring a new Azure Function entry point: HTTP, timer, queue, or event.
- Instrumenting a new outbound call: Cosmos DB, Microsoft Graph, external HTTP,
  or another service.
- Diagnosing a slow or failing request.
- Proposing a new metric or alert.

**Out of scope:** browser-side product analytics. Browser telemetry conventions
should be documented separately when needed.

---

## 2. Logger Choice

| Layer | Logger | Why |
| --- | --- | --- |
| `api/` (Functions) | Structured JSON logger plus Azure Functions OpenTelemetry instrumentation | Queryable logs, trace correlation, and App Insights export. |
| Functions legacy call sites | `context.log` or `InvocationContext.log` | Tolerated until ported. Do not introduce new ones. |
| Browser UI | `console.warn` / `console.error` plus project event hooks | Captured by browser telemetry when configured. |
| Build-time scripts | `console.*` | Out of scope for this protocol. |

SWA managed Functions do not support every Azure identity pattern. Use the
authentication mechanism documented in `INFRASTRUCTURE.md` for telemetry export,
and verify emitted traces in the target environment after changing it.

---

## 3. Canonical Field Names

One name per concept. New fields MUST extend this table.

| Field | Type | Meaning |
| --- | --- | --- |
| `traceId` | string | OpenTelemetry trace id. Auto-injected by instrumentation where possible. |
| `spanId` | string | OpenTelemetry span id. Auto-injected where possible. |
| `invocationId` | string | Azure Functions invocation id; ties logs to platform metrics. |
| `route` | string | Function route template, e.g. `/api/profile`. Not the raw URL. |
| `userHash` | string | Pseudonymized user identifier. Never log the raw identifier. |
| `outcome` | enum | `"ok"`, `"client_error"`, `"server_error"`, or `"rate_limited"`. |
| `durationMs` | number | Total handler duration, integer ms. |
| `dependency` | string | Outbound system, e.g. `"cosmos"`, `"graph"`, `"http"`, `"swa-auth"`. |
| `dependencyOp` | string | The operation at the dependency, e.g. `"cosmos.queryItems"`. |
| `errorClass` | string | First class on the error chain, e.g. `"TimeoutError"`. |

Do NOT log:

- Raw email addresses, names, postal addresses, phone numbers, or account IDs.
- Promo codes, HMAC tokens, JWTs, session cookies, API keys, or authorization
  headers.
- Request bodies that may contain personal, financial, regulated, or
  user-supplied sensitive data.

---

## 4. Log Levels

| Level | When |
| --- | --- |
| `error` | Server-side failure that interrupted the user request. Always carries `errorClass` and stack when available. |
| `warn` | Client-side failure, rate-limit trigger, retried dependency call, or graceful degradation. |
| `info` | Request start/end and side-effectful state changes. |
| `debug` | Conditional. Only emitted when `LOG_LEVEL=debug`. Default off in production. |

Do not log on hot-path reads that return cached/static data unless there is a
specific diagnostic need. Sampling with `info` is usually better than emitting
one log per successful read.

---

## 5. Spans

- **Top-level span:** the HTTP handler. Auto-created by Functions
  instrumentation when configured.
- **Outbound dependencies** MUST be wrapped as child spans with attribute
  `dependency` set per section 3. Instrument dependency wrappers, not every call
  site.
- **Internal compute** gets a span only if you expect to alert on its latency or
  need it to diagnose user-visible failures.

---

## 6. Metrics

Use OpenTelemetry counters for state events whose rate matters:

| Metric | Type | Labels | Why |
| --- | --- | --- | --- |
| `api.requests` | counter | `route`, `outcome` | Drives API reliability dashboards. |
| `api.dependency.errors` | counter | `dependency`, `errorClass` | Catches downstream failures before they dominate user-visible errors. |
| `notification.sent` | counter | `kind` | Tracks outbound notification volume and quota pressure. |
| `background.job.completed` | counter | `job`, `outcome` | Tracks scheduled or asynchronous work. |

Latency is usually captured by HTTP instrumentation. Do not add a custom
histogram unless the built-in telemetry cannot answer the operational question.

---

## 7. Wiring Reference

Place the logger in `api/src/logger.ts` or the equivalent API infrastructure
module. Import telemetry setup once from the API bootstrap before Functions are
registered.

The connection string comes from `APPLICATIONINSIGHTS_CONNECTION_STRING` in the
environment's app settings. The logger MUST NOT read unrelated secrets to
authenticate telemetry export.

---

## 8. Anti-Patterns

- **String interpolation in messages.** `log.info(\`user ${id} did X\`)` blocks
  structured queries. Use `log.info({ userHash, action: "X" })`.
- **One log line per loop iteration.** Aggregate and log once with a count.
- **Logging on the success path of high-RPS endpoints** such as `/.auth/me`.
  Trace and metrics are enough.
- **Catch-and-log-and-rethrow.** Pick one: handle it, or rethrow with context.
  Double-logging poisons the error budget.
- **`console.log` in `api/`.** ESLint should flag this during review.
