# AGENTS.md

Strategic directives for agents working in this project.

## 1. Think Before Coding

State assumptions. If a task has multiple plausible readings, name them before
editing. If the request is unclear and guessing would be risky, ask.

## 2. Read Before Writing

Before extending a module, read its public boundary and the nearest callers or
consumers. Match existing conventions.

## 3. Necessity Before Execution

Verify that a requested fix addresses a real problem in this stack. Do not add
frameworks, services, abstractions, or directories for speculative future use.

## 4. Surgical Changes

Touch only what the task requires. Do not mix unrelated cleanup, migrations, or
style changes into feature work.

## 5. Architecture Defaults

- Keep business decisions in pure, testable code.
- Keep I/O at the edges.
- Prefer explicit contracts over implicit coupling.
- Keep dependency graphs directed and shallow.
- Encode recurring rules as tests, linters, schemas, or CI gates.

## 6. CI/CD Defaults

- Build once, promote the same artifact.
- Use OIDC or federated identity for cloud access.
- Keep jobs self-contained and idempotent.
- Add explicit timeouts to long-running jobs.
- Health-check deployments before promotion.

## 7. Report Honestly

Do not call work complete if checks were skipped, guessed, or could not run.
Surface uncertainty and the exact remaining step.
