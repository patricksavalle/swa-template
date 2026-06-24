# Retention Matrix

Retention must be defined before a project processes real personal, customer, or
regulated data. Encode retention in infrastructure or data-access code once
dates are known.

| Dataset | Purpose | Template default | Project decision required | Deletion and legal hold notes |
| --- | --- | --- | --- | --- |
| Static demo content | Product scaffolding and acceptance UI | Source controlled until replaced | Confirm it remains fictional | Do not replace with customer-like real data. |
| Static deploy artifacts | Deployment evidence and rollback | GitHub artifact retention is workflow-specific | Confirm production release evidence duration | Never include source data files in deploy artifacts. |
| Smoke evidence | Deployment verification | Workflow artifact settings | Confirm production smoke evidence duration | Store only URL, status, commit, and timestamp. |
| Application telemetry | Reliability, diagnostics, security triage | Infrastructure setting | Define by environment and risk | Telemetry must not become the audit ledger. |
| Audit events | Accountability for sensitive actions | Not implemented | Define per event class before sensitive actions exist | Separate operational logs from audit records. |
| Tenant membership | Authorization and administration | Not implemented | Define after role model is approved | Support deactivation and historical audit needs. |
| Domain records | Application-specific data | Not implemented | Define per project | Prefer minimized or pseudonymized storage when possible. |
| Generated files | Reports, exports, attachments | Not implemented | Define when storage is introduced | Classify files before storage. |

## Implementation Rules

- Do not rely on manual cleanup for personal or regulated data.
- Keep legal hold explicit. A hold must state scope, owner, start date, and
  review date.
- Verify deletion with tests or operational evidence before launch.

