# Data Inventory

This inventory is a working Article 30-style scaffold. Update it when a feature
adds a data source, new personal data category, new recipient, or new retention
behavior.

## Current Template State

The template includes synthetic/static content, operational health endpoints,
Azure resource metadata, and infrastructure scaffolding. A project created from
this template must decide whether and when it will process personal data before
adding real customer, user, employee, financial, health, or regulated data.

## Starter Categories

| Category | Examples | System | Personal data | Status |
| --- | --- | --- | --- | --- |
| Static demo content | Placeholder names, counts, feature descriptions | Static site | No, if kept fictional | Allowed in all environments. |
| Operational metadata | Environment, service status, resource status | API, Application Insights | Usually no | Keep public output minimal. |
| Identity metadata | Tenant id, client id, tenant name, roles | Entra External ID, API | Can become personal when linked to users | Restrict detailed views to admin/ops roles. |
| Tenant membership | Tenant id, user id, role, invitation status | Future data store | Yes | Requires access control, retention, and audit rules. |
| Domain records | Project-specific records introduced by the app | Future data store | Project-specific | Classify before implementation. |
| Audit events | Actor hash, tenant, action, outcome, timestamp | Future audit store | Pseudonymous personal data | No raw identifiers or payloads in logs. |
| Telemetry | Route, outcome, duration, dependency, error class | Application Insights, Log Analytics | Can include IP/platform data | Keep payload-free and retention-bound. |

## Required Before Real Personal Data

- Confirm controller/processor roles and DPA ownership.
- Complete a DPIA threshold assessment for the project context.
- Define retention and deletion behavior for each data category.
- Implement role-based access for personal data views and APIs.
- Verify logging and telemetry do not include personal data, request bodies,
  source records, tokens, or connection strings.

