# Implementation Patterns

Use this reference when writing security fixes, tests, scan commands, or concrete remediation examples.

## Authorization Fix Pattern

- Put authorization close to the data access or state change.
- Scope queries by subject and tenant instead of filtering after fetch.
- Centralize repeated checks in an existing policy, guard, middleware, or service helper.
- Test unauthenticated, wrong-role, wrong-tenant, and owner cases.
- Avoid trusting client-supplied role, tenant, price, ownership, status, or permission fields.

## Validation Fix Pattern

- Validate at the boundary with a schema or framework request object.
- Coerce only when the business rule expects coercion; otherwise reject ambiguous values.
- Use allowlists for enum-like values such as sort fields, formats, redirect targets, role names, and webhook event types.
- Preserve raw input only when needed for audit or signature verification; store safely and redact logs.
- Return generic validation errors for sensitive workflows such as login and reset.

## Cryptography Fix Pattern

- Use maintained libraries and framework primitives; avoid custom crypto protocols.
- Hash passwords with Argon2id, bcrypt, or scrypt with current cost settings.
- Use authenticated encryption such as AES-GCM, ChaCha20-Poly1305, or a vetted envelope-encryption service.
- Generate random nonces/IVs as required by the algorithm and never reuse them with the same key.
- Keep keys in a managed secret store or environment secret system; plan rotation and revocation.
- Compare secrets and MACs with constant-time helpers when available.

## Security Regression Tests

Good security tests exercise denial paths, not only the happy path:

- Unauthenticated request returns 401.
- Authenticated but unauthorized request returns 403 or intentional 404.
- User from another tenant cannot read, update, delete, list, search, export, or infer the object.
- Non-admin cannot call admin function through alternate route, method, GraphQL mutation, or WebSocket message.
- Malicious input reaches validation and never reaches SQL, shell, template, HTML, file path, or URL sinks.
- Expired, revoked, malformed, wrong-audience, and wrong-issuer tokens are rejected.
- Rate, size, pagination, recursion, and token limits are enforced.

## Dependency and Configuration Scans

Use repository-native tooling first. Run only commands that fit the detected stack:

```bash
npm audit
pnpm audit
yarn npm audit
pip-audit
python -m pip-audit
dotnet list package --vulnerable --include-transitive
cargo audit
bundle audit check --update
govulncheck ./...
osv-scanner -r .
```

If the command is unavailable, say so and use the closest configured alternative. Do not auto-upgrade major versions without checking breakage.

## Secret Search Seeds

```bash
rg -n "AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----|xox[baprs]-|gh[pousr]_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}" .
rg -n "password\\s*=|passwd\\s*=|secret\\s*=|api[_-]?key\\s*=|private[_-]?key\\s*=|token\\s*=" .
```

Treat search results as potentially sensitive. Do not paste secrets into the final answer.

## Remediation Report Shape

When describing a fix, include:

- What control was missing.
- Where the control now lives.
- Which abuse case the test covers.
- Which scan or test command was run.
- Any remaining risk or operational follow-up, such as rotating exposed credentials or adding alerting.
