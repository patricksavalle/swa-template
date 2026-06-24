# DPIA Draft

This is a working DPIA scaffold for projects created from the template. It is
not a completed legal assessment.

## Threshold Assessment

| Question | Current answer | Follow-up |
| --- | --- | --- |
| Does the template process personal data by default? | No real personal data is intended. | Keep demos synthetic. |
| Will the project process personal, confidential, or regulated data? | Project-specific. | Complete this assessment before implementation. |
| Will processing be systematic or repeated? | Project-specific. | Document data flows and frequency. |
| Will there be profiling or automated decisions? | Not in the template. | Document any project-specific decision logic. |
| Are special category data involved? | Not in the template. | Block unnecessary fields by default. |

## Processing Description

- Purpose: project-specific.
- Data subjects: project-specific users, customers, employees, or other groups.
- Data sources: project-specific forms, identity providers, imports, APIs, or
  generated records.
- Storage: project-specific Azure resources and future storage services.
- Recipients: hosting providers, identity providers, telemetry providers, and
  subprocessors listed in `subprocessors.md`.

## Necessity And Proportionality

- Collect only fields needed for the documented purpose.
- Prefer derived, minimized, or pseudonymized data over raw source records.
- Restrict admin and evidence views by tenant and role.
- Do not use production or customer data in previews, tests, screenshots, or
  local demos.

## Initial Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| User payloads leak through logs or artifacts. | Enforce the observability protocol, privacy guardrail validator, and secret scanning. |
| Infrastructure metadata exposes attack surface. | Restrict detailed resource views to admin/ops roles or redact public output. |
| Secrets are available as app settings. | Move to Key Vault and managed identity before high-risk data. |
| Retention is undefined. | Complete `retention-matrix.md` and encode retention controls. |
| Data subject rights cannot be fulfilled quickly. | Implement search/export/delete runbooks and tests before launch. |

## Go/No-Go Before Real Personal Data

- [ ] Role-based route and API access policies are implemented.
- [ ] Retention and deletion behavior is encoded and tested.
- [ ] DPIA residual risks are accepted by the accountable owner.
- [ ] DPA, subprocessors, and international transfer positions are documented.
- [ ] Logging and telemetry rules are implemented in code review checks.
- [ ] Data subject rights workflow has an owner and operational path.

