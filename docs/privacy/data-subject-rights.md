# Data Subject Rights Runbook

This runbook is a scaffold for GDPR data subject rights requests. Complete the
project-specific system search and fulfillment path before processing real
personal data.

## Intake

- Record request date, channel, requester identity, tenant/customer, and request
  type.
- Classify the request: information, access, rectification, erasure,
  restriction, portability, objection, or automated-decision/profiling concern.
- Verify identity through the project-approved process before disclosing or
  modifying personal data.
- Identify whether the project is acting as controller, processor, or
  subprocessor for the specific request.

## System Search Scope

| System | Search key | Status |
| --- | --- | --- |
| Identity provider | User id, email, tenant id | Future role model needed. |
| Tenant membership store | Tenant id, user id, role | Not implemented. |
| Domain data store | Project-specific identifiers | Project-specific. |
| Generated files | Project-specific identifiers | Not implemented. |
| Audit events | Actor hash, tenant id, action window | Not implemented. |
| Telemetry | Trace id, route, time window | Avoid personal data; use only when necessary. |

## Fulfillment Notes

- Access/export: provide only the requester-specific data and explain purposes,
  categories, recipients, retention, and source where required.
- Rectification: correct source-derived data through the source workflow when
  possible, then rerun affected calculations.
- Erasure: delete or anonymize data unless retention, legal hold, or controller
  instructions require otherwise.
- Restriction: block processing while preserving data needed for dispute or
  legal reasons.
- Portability: define a structured export format before real data launch.

## Operational Guardrails

- Keep response deadlines visible to the accountable owner.
- Do not disclose another person's data through grouped analysis or reports.
- Document every decision, exception, and identity verification step.
- Test the search/export/delete path before real data launch.
