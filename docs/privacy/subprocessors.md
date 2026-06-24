# Subprocessors

Maintain this register before onboarding customers or processing real personal
data. Confirm contracts, regions, and transfer mechanisms with the accountable
business or legal owner.

| Provider | Role | Data classes | Environment | Status |
| --- | --- | --- | --- | --- |
| Microsoft Azure | Hosting, Azure Static Web Apps, Functions, Cosmos DB, Log Analytics, Application Insights | Operational metadata now; future project data if workloads use Azure | Acceptance and production | DPA and region choices to confirm before real data. |
| Microsoft Entra External ID | Identity provider | Identity metadata, authentication events, roles | Acceptance and production | Tenant/app registration lifecycle is external to Bicep. |
| GitHub | Source control, CI/CD, artifacts, environment secrets | Source, deployment metadata, smoke evidence, secrets metadata | Build and deployment | Keep artifacts synthetic and secret-scanned. |
| Cloudflare | DNS and optional edge services | DNS metadata; potential IP-level traffic metadata if proxied | Public domains | Use short-lived setup tokens; confirm role before proxying production traffic. |
| Project-specific providers | Integrations, imports, exports, notifications, or analytics | Project-specific | Project-specific | Add before implementation. |

## Review Checklist

- [ ] Provider is necessary for the processing purpose.
- [ ] Data classes are minimized and documented.
- [ ] Region and transfer mechanism are known.
- [ ] DPA or equivalent contract is in place.
- [ ] Security and breach notification obligations are understood.
- [ ] Provider can support deletion, export, or restriction needs where relevant.

