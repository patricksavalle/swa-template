# LLM and GenAI Security

Use this reference for chatbots, copilots, RAG, agents, model tool calls, prompt pipelines, AI-generated code execution, and model output flowing into other systems.

## OWASP LLM Top 10 2025

| ID | Risk | Review focus |
| --- | --- | --- |
| LLM01 | Prompt Injection | Direct and indirect instructions that override intended behavior or steer tool use. |
| LLM02 | Sensitive Information Disclosure | Secrets, PII, customer data, proprietary data, hidden context, logs, and training retention. |
| LLM03 | Supply Chain | Models, adapters, datasets, embeddings, plugins, tools, SDKs, and provider dependencies. |
| LLM04 | Data and Model Poisoning | Poisoned training, fine-tuning, feedback, RAG content, indexes, and eval datasets. |
| LLM05 | Improper Output Handling | Model output used as HTML, SQL, shell, code, config, decisions, or API parameters. |
| LLM06 | Excessive Agency | Too many tools, broad permissions, high-impact actions, or autonomous multi-step loops. |
| LLM07 | System Prompt Leakage | Hidden instructions or policy text exposed through output or tool-accessible context. |
| LLM08 | Vector and Embedding Weaknesses | Cross-tenant retrieval, poisoned documents, embedding inversion risk, weak metadata ACLs. |
| LLM09 | Misinformation | Unsupported claims, fabricated citations, unsafe decisions, and over-trusted outputs. |
| LLM10 | Unbounded Consumption | Token, tool, recursion, retrieval, job, and cost exhaustion. |

## Threat Model Checklist

- Identify every untrusted text source: user prompts, documents, webpages, emails, tickets, code comments, commit messages, search results, tool output, and retrieved chunks.
- Separate instructions from data in prompts. Delimit untrusted content and describe it as data, not policy.
- Keep secrets, credentials, private keys, and irreversible business logic out of prompts and model-visible tools.
- Treat model output as untrusted input to downstream systems.
- Make tool authorization independent of the model's natural-language reasoning.
- Log model actions with enough detail to audit decisions, but redact sensitive prompt and output fields.

## Prompt Injection Controls

- Do not rely on "ignore malicious instructions" prompt text as the only defense.
- Use least-privilege tools and per-tool authorization checks.
- Require human approval for write, delete, purchase, send-email, deploy, credential, permission, or financial actions.
- Validate tool arguments against schemas and business rules after the model proposes them.
- For indirect prompt injection, sanitize and label retrieved or browsed content and prevent it from redefining system/developer instructions.
- Add tests with malicious instructions embedded in documents, webpages, comments, and tool results.

## RAG and Vector Stores

- Enforce document ACLs before retrieval and verify tenant/user ownership again before showing citations or using chunks.
- Keep tenant indexes separate when practical; otherwise use mandatory metadata filters and tests proving isolation.
- Treat retrieved chunks as attacker-controlled text.
- Track source, version, ingestion time, and owner for each chunk.
- Protect ingestion pipelines against poisoned content, hidden prompt text, malicious Markdown/HTML, and oversized files.
- Do not assume embeddings are non-sensitive; avoid embedding secrets or regulated data without a retention and access-control plan.

## Agents and Tools

- Maintain an explicit allowlist of tools available to each user, role, tenant, and task.
- Give tools scoped credentials rather than broad application credentials.
- Add step, time, token, retry, and cost budgets to agent loops.
- Require confirmation for high-impact actions and show the exact action arguments to the user or approver.
- Block tool arguments that cross trust boundaries, such as arbitrary URLs, shell commands, file paths, SQL, or recipient lists, unless a separate validator approves them.
- Make audit logs tamper-resistant enough for incident review.

## Output Handling

- Validate structured outputs with schemas before use.
- Escape or sanitize any model-generated HTML, Markdown, links, filenames, formulas, and code.
- Do not execute model-generated code or shell commands without sandboxing, review, and explicit approval.
- Parameterize downstream database/API calls; never concatenate model output into SQL, commands, templates, or selectors.
- For critical domains, require citation checks, confidence thresholds, or human review.

## LLM Regression Tests

Add targeted tests or eval cases for:

- Direct prompt injection asking the model to reveal system instructions or bypass policy.
- Indirect prompt injection inside retrieved documents or tool output.
- Cross-tenant RAG retrieval and citation leakage.
- Tool-call argument injection and unauthorized tool use.
- Model output rendered as HTML/Markdown with XSS payloads.
- Excessive loop, token, retrieval, and tool-call consumption.
- Sensitive data redaction in prompts, outputs, traces, and logs.
