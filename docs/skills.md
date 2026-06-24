# Skills

This template includes generic agent skills that can be used as project-local
guidance. They are vendored under `.agents/skills/` so a new project starts
with a complete, ready-to-clone agent baseline and can remove anything that
does not fit.

## Included Skills

| Skill | Purpose |
| --- | --- |
| `architecture-guidelines` | First-principles architecture discipline. |
| `geometric-architecture` | Component placement and dependency graph constraints. |
| `structural-simplification` | Complexity comparison for refactors and structure changes. |
| `technical-design` | Document and verify implemented module boundaries and data flow. |
| `defect-shift-left` | Place checks at the earliest stage that can catch defects. |
| `architecture-as-code` | Stack-agnostic pattern for executable architecture rules. |
| `architecture-as-code-javascript` | JavaScript and TypeScript architecture-rule implementation. |
| `architecture-as-code-python` | Python architecture-rule implementation. |
| `functionality-complexity-tradeoff` | Necessity and worth gate for features and existing code. |
| `ci-cd-reliability-architecture` | CI/CD reliability rules for idempotent, safe deployments. |
| `system-optimization` | Constraint-driven system and workflow optimization. |
| `continuous-improvement` | Promote recurring lessons into tests, checks, or skill edits. |
| `design-and-refactor` | Orchestrates the design/refactor decision sequence. |
| `accessibility-audit` | WCAG 2.2 AA audit gates for components, pages, and releases. |
| `deep-research` | Citation-backed research workflow for comprehensive analysis. |
| `eslint-fix-protocol` | Disciplined protocol for fixing ESLint findings. |
| `gdpr-dsgvo-expert` | GDPR and DSGVO privacy review guidance. |
| `issue-refinement` | Convert raw issues into implementation-ready specs. |
| `observability-protocol` | Structured logging, tracing, metrics, and PII-safe telemetry. |
| `owasp-security` | OWASP-based secure coding, API, web, and LLM security review guidance. |
| `release-management` | Production release branch, changelog, version, and PR protocol. |
| `request-to-response-pipeline` | Trace changes across browser, API, auth, and storage boundaries. |
| `rest-api-review` | REST API contract and endpoint review guidance. |
| `skill-creation` | Create or update project-local agent skills. |
| `swa-authenticate` | Authenticate SWA preview browser sessions for protected routes. |
| `whitepapers` | Structure and write evidence-backed whitepapers. |

## Use In A Project

Keep `.agents/skills/` as the canonical source.

Examples:

```text
.agents/skills/                 canonical source for this template
.claude/skills/                 optional generated target for Claude-style tools
```

## Maintenance Rules

- Each skill directory must contain `SKILL.md`.
- Skill text should remain project-neutral unless the target project explicitly
  owns a domain-specific skill.
- Add project-specific skills beside the generic ones, not by editing generic
  skills in place.
