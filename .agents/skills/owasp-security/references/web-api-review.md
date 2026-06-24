# Web and API Security Review

Use this reference for web applications, REST APIs, GraphQL APIs, WebSockets, file uploads, browser security controls, and service-to-service integrations.

## API Security Top 10 2023

| ID | Risk | Review focus |
| --- | --- | --- |
| API1 | Broken Object Level Authorization | Every endpoint that accepts an object ID needs object-level authorization at the data access boundary. |
| API2 | Broken Authentication | Login, reset, MFA, token issue, token refresh, session invalidation, credential stuffing, and brute-force controls. |
| API3 | Broken Object Property Level Authorization | Mass assignment, over-posting, excessive response fields, hidden admin fields, and per-field authorization. |
| API4 | Unrestricted Resource Consumption | Rate limits, pagination caps, file size limits, query depth, timeouts, concurrency, and background job quotas. |
| API5 | Broken Function Level Authorization | Admin/moderator/internal functions exposed through route, method, GraphQL mutation, or WebSocket message. |
| API6 | Unrestricted Access to Sensitive Business Flows | Abuse of checkout, invitation, promotion, password reset, messaging, scraping, voting, or booking flows. |
| API7 | Server Side Request Forgery | URL fetchers, importers, webhooks, image/PDF processors, metadata fetches, redirects, and DNS rebinding. |
| API8 | Security Misconfiguration | CORS, headers, debug endpoints, default accounts, verbose errors, open buckets, and cloud permissions. |
| API9 | Improper Inventory Management | Old API versions, undocumented endpoints, forgotten admin routes, shadow GraphQL fields, stale schemas. |
| API10 | Unsafe Consumption of APIs | Blind trust in partner APIs, unsigned webhooks, weak TLS validation, unvalidated third-party payloads. |

## Access Control

- Enforce authorization on the server for every sensitive object, function, and property.
- Scope database queries by authenticated subject, tenant, and role before fetching records.
- Prefer policy helpers or declarative guards already used in the codebase.
- Return 404 instead of 403 only when the application intentionally hides object existence; do not use this to skip authorization.
- Test cross-tenant reads, writes, deletes, list endpoints, exports, search, and background jobs.

## Authentication and Sessions

- Store passwords with Argon2id, bcrypt, scrypt, or a framework-approved adaptive hash. Never encrypt or plaintext-store passwords.
- Rate-limit login, signup, password reset, MFA, and token refresh paths.
- Avoid user enumeration in reset and login flows.
- Use `HttpOnly`, `Secure`, and appropriate `SameSite` cookies for browser sessions.
- Keep access tokens short-lived. Rotate and revoke refresh tokens on logout, password change, suspicious use, and privilege changes.
- Validate JWT issuer, audience, algorithm, expiry, not-before, and signing key. Do not accept `none` or confuse symmetric/asymmetric algorithms.

## CSRF, CORS, and Browser Controls

- Add CSRF protection to state-changing browser requests that rely on cookies or ambient credentials.
- Do not treat `SameSite` as the only CSRF defense for high-risk actions.
- Configure CORS with exact trusted origins. Never combine wildcard origins with credentials.
- Use CSP, `frame-ancestors`, HSTS, `X-Content-Type-Options`, and a conservative referrer policy when the app serves browser content.
- Escape by output context: HTML text, HTML attribute, URL, JavaScript string, CSS, Markdown, and rich text all need different handling.

## Injection and Unsafe Sinks

- Use parameterized queries or ORM query builders for SQL and NoSQL.
- Avoid shell invocation. If unavoidable, use non-shell APIs with argument arrays and strict allowlists.
- Treat template names, file paths, sort fields, query operators, and deserialization formats as input requiring validation.
- Never pass untrusted data to `eval`, dynamic function constructors, unsafe YAML loaders, pickle, raw SQL, raw HTML sinks, or command shells.
- Sanitize rich HTML with a maintained sanitizer and a small allowlist; still render it under CSP.

## File Uploads and Content Processing

- Enforce allowlisted extensions, MIME type checks, magic-byte checks, size limits, and per-user quotas.
- Store uploads outside the web root or behind controlled object storage.
- Generate server-side file names; do not trust client names or paths.
- Scan or quarantine risky formats when the application processes documents, archives, images, or media.
- Prevent zip slip, decompression bombs, parser RCEs, and metadata leakage.

## SSRF and Outbound Requests

- Prefer explicit host allowlists over deny lists.
- Parse and normalize URLs once, then validate scheme, host, port, and resolved IPs.
- Block localhost, private ranges, link-local ranges, metadata services, IPv6 local ranges, and internal DNS names unless explicitly required.
- Revalidate after redirects and DNS resolution. Set tight timeouts and response size limits.
- Do not forward user-supplied headers, cookies, or credentials to fetched URLs.

## Logging, Errors, and Monitoring

- Log security events: failed login, MFA failure, access denied, privilege change, token refresh anomaly, password reset, suspicious rate, and admin action.
- Redact secrets and sensitive fields before logs leave the process.
- Use centralized error handling. Return stable user-safe errors and keep stack traces out of production responses.
- Alert on high-risk patterns, not just crashes.

## Supply Chain and Configuration

- Use repository-native lockfiles and package manager audit tools.
- Pin CI actions, container base images, and deployment artifacts where feasible.
- Remove unused packages and abandoned transitive dependencies when they raise risk.
- Validate required security environment variables on boot.
- Keep production debug endpoints, admin consoles, test accounts, and seed credentials disabled.

## Review Search Seeds

```bash
rg -n "authorize|policy|permission|role|tenant|owner|userId|accountId|organizationId" .
rg -n "raw\\(|query\\(|execute\\(|SELECT|INSERT|UPDATE|DELETE|whereRaw|aggregate\\(|\\$where" .
rg -n "innerHTML|dangerouslySetInnerHTML|v-html|bypassSecurityTrust|eval\\(|new Function" .
rg -n "exec\\(|execFile\\(|execSync\\(|spawn\\(|ProcessBuilder|Runtime\\.getRuntime" .
rg -n "cors\\(|CORS|csrf|sameSite|HttpOnly|Secure|Content-Security-Policy|frame-ancestors" .
rg -n "upload|multipart|formidable|multer|busboy|zip|tar|extract|imagemagick|ffmpeg" .
rg -n "fetch\\(|axios|requests\\.|http\\.Get|URL\\(|webhook|callback|redirect" .
```
