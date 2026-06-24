---
name: owasp-security
description: "Implement and review secure code using current OWASP guidance: OWASP Top 10:2025 for web applications, OWASP API Security Top 10 2023, OWASP LLM Top 10 2025, secure authentication and authorization, input validation, cryptography, supply chain security, logging, SSRF, CSRF, XSS, injection, dependency scanning, threat modeling, and security code reviews."
---

# OWASP Security

Use this skill to implement secure code, fix vulnerabilities, or review code through OWASP-based threat modeling.

## Source Baseline

- OWASP Top 10:2025 for web application risks: https://owasp.org/Top10/2025/
- OWASP API Security Top 10 2023 for API-specific risks: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- OWASP LLM Top 10 2025 for LLM and GenAI application risks: https://genai.owasp.org/llm-top-10/
- OWASP Cheat Sheet Series for detailed controls: https://cheatsheetseries.owasp.org/

If the user asks for "latest", compliance wording, or source attribution, verify the official OWASP pages before asserting versions.

## Operating Rules

- Start by identifying entry points, trust boundaries, sensitive data, auth model, tenant boundary, and privileged actions.
- Treat every external value as untrusted: route params, query/body fields, headers, cookies, uploaded files, webhooks, callbacks, deserialized data, third-party API responses, retrieved documents, and LLM output.
- Prefer framework-native controls and established libraries over custom security code.
- Fail closed. Default to deny, reject ambiguous input, and keep authorization checks server-side.
- Fix the root control near the data, policy, or sink. Do not rely on client-side hiding, obfuscated IDs, or UI checks.
- Do not log secrets, tokens, credentials, reset links, session IDs, PII beyond operational need, or raw attacker payloads.
- Add targeted regression tests for security fixes when the repository has a test setup.
- Do not weaken security to satisfy tests. Update tests to reflect the secure behavior.
- When a mitigation is partial, name the residual risk and the next hardening step.

## Core Workflow

1. Map the feature or bug to assets, actors, trust boundaries, and abuse cases.
2. Search for risky sinks and missing controls with `rg` before editing.
3. Classify likely OWASP categories and load only the relevant reference file below.
4. Implement the smallest secure change that fits local patterns.
5. Add negative tests: unauthorized actor, wrong tenant, malformed input, malicious sink payload, or resource abuse.
6. Run relevant tests and configured scans where practical.
7. Report the risk fixed, test evidence, and any residual risk.

## OWASP Top 10:2025 Map

| ID | Risk | Look for | Prefer |
| --- | --- | --- | --- |
| A01 | Broken Access Control | Missing object/function/property authorization, IDOR, tenant leaks, CSRF | Central policy checks, tenant scoping in queries, deny-by-default middleware |
| A02 | Security Misconfiguration | Debug modes, permissive CORS, weak headers, default creds, open storage, verbose errors | Hardened defaults, exact allowlists, safe error handling, environment validation |
| A03 | Software Supply Chain Failures | Vulnerable dependencies, unsigned artifacts, stale images, unpinned actions, typosquatting | Lockfiles, advisory scans, SBOMs, signed releases, pinned CI actions/images |
| A04 | Cryptographic Failures | Plaintext secrets, weak algorithms, bad key handling, missing TLS, reversible passwords | Argon2id/bcrypt for passwords, AEAD for encryption, managed secrets, key rotation |
| A05 | Injection | SQL/NoSQL/OS/LDAP/template/header/deserialization injection, unsafe DOM writes | Parameterized APIs, structured builders, allowlists, output encoding, sandboxing |
| A06 | Insecure Design | Missing abuse-case controls, unsafe workflows, no rate limits, over-broad privileges | Threat modeling, least privilege, abuse-case tests, business-flow limits |
| A07 | Authentication Failures | Weak login/reset/session/token flows, no MFA, token reuse, credential stuffing | MFA where appropriate, short-lived access tokens, refresh-token revocation, rate limits |
| A08 | Software or Data Integrity Failures | Unsigned updates, unverified webhooks, unsafe CI/CD, insecure deserialization | Signature verification, protected pipelines, artifact provenance, strict parsers |
| A09 | Security Logging and Alerting Failures | Missing audit events, no alerting, secret-heavy logs, weak correlation | Security event logs, alert thresholds, correlation IDs, safe redaction |
| A10 | Mishandling of Exceptional Conditions | Crashes, unsafe fallbacks, verbose stack traces, inconsistent cleanup | Central error handling, user-safe messages, transactional cleanup, safe defaults |

SSRF remains important even though it is no longer a standalone web Top 10:2025 item. Review SSRF under access control, injection, API7:2023, and unsafe outbound integrations.

## Reference Routing

- Read `references/web-api-review.md` for web apps, REST/GraphQL APIs, WebSockets, CSRF/CORS, file uploads, SSRF, headers, dependency risk, and API Top 10 mapping.
- Read `references/llm-security.md` for AI features, LLM apps, RAG, agents, tool calls, model output handling, prompt injection, and OWASP LLM Top 10:2025.
- Read `references/implementation-patterns.md` when writing or testing security fixes, choosing scan commands, or producing concrete remediation examples.

## Review Output

For security reviews, lead with findings ordered by severity. Each finding should include:

- Severity such as P0, P1, P2, or P3.
- File and line reference.
- The exploit path or concrete failure mode.
- The recommended fix and a regression test idea.

If no issues are found, say so clearly and mention remaining test or scan gaps.

## Useful Search Seeds

Use these as starting points, then adapt to the stack:

```bash
rg -n "dangerouslySetInnerHTML|innerHTML|eval\(|new Function|exec\(|execSync|spawn\(|raw\(|query\(|SELECT .*\\$\\{|jwt\\.sign|cookie|cors\\(|csrf|localStorage|sessionStorage|deserialize|pickle|yaml\\.load|fetch\\(|requests\\." .
rg -n "TODO|FIXME|auth|authorize|permission|role|tenant|owner|admin|secret|token|password|apikey|api_key|private_key" .
```
