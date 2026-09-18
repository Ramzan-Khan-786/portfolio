# Authentication and security

## Administrator lifecycle

There is no public registration endpoint. The seed creates an absent admin with an explicit email and a non-placeholder password of at least 12 characters and at most 72 UTF-8 bytes; it never resets existing credentials. The byte limit also applies to password changes, preventing bcrypt truncation of multibyte characters. Passwords use bcrypt cost 12 in application flows. Test-only users use a lower cost for speed.

Login compares a dummy hash for unknown emails and returns a generic invalid-credentials message. A successful login sets an HTTP-only portfolio_admin cookie restricted to /api. JWTs are signed with HS256, an explicit issuer/audience, subject, expiry, and session version. Each protected request looks up the current database role and session version.

Logout increments sessionVersion, invalidating copied cookies and other sessions for that user. Account password change verifies the current password, updates the hash/version, and issues a fresh cookie for the current session. Restarting with a changed JWT secret invalidates every session. No reset-email workflow is included; do not expect seeding to recover an existing password.

## Request protections

- Every mutation requires X-Portfolio-Request: cms; browser cross-origin use therefore requires successful CORS preflight.
- Present Origin headers must match the configured allowlist. Cross-site fetches without an Origin are rejected.
- Production cookies are Secure; SameSite defaults to lax. Cross-site deployment requires none plus HTTPS and may still be blocked by third-party-cookie settings.
- Login is limited to 15 requests per 15 minutes/IP; password changes to 10; admin namespace to 500.
- Auth/admin responses are no-store. Helmet applies API response headers.
- URL validation rejects script/data schemes and credential-bearing URLs. Plain text is rendered without raw HTML.
- Bad IDs, malformed JSON, duplicate keys, excessive payloads, and validation errors have safe status responses.
- Public bootstrap exposes only an allowlist of setting keys and public project data.

Custom headers/origin checks are browser CSRF defenses, not a replacement for authentication. Curl/nonbrowser clients can set headers but still need a valid admin session. Never use wildcard CORS for credentials. TRUST_PROXY must match trusted network topology so client-IP limits remain meaningful.

## Iframe trust

Showroom uses a sandbox with scripts, forms, popups, and same-origin capability for the independent app, but no top-level navigation. Only configure apps you trust. Direct same-origin embedding is rejected to avoid portfolio recursion and the dangerous same-origin/script combination. Keep embedded apps on a separate origin; ensure configured URLs do not redirect back onto the portfolio origin.

A portfolio:ready message is accepted only from the current iframe window and configured origin. It is a UI readiness signal, not authentication. An iframe load event cannot prove that a remote application loaded successfully; visitors retain troubleshooting/reload/open-full controls.

## Deployment checks and limits

Serve both applications over HTTPS, protect database credentials in the server secret store, limit database network access, configure frontend response security headers, and keep backups. V1 has no MFA, distributed session store, immutable audit log, upload pipeline, or independent penetration test. Rate limits reset on process restart and are not shared between API instances.

Production dependency audit currently reports no known vulnerabilities; this is a point-in-time advisory check, not proof of security. Repeat npm audit after dependency updates. Follow the [Express production security guidance](https://expressjs.com/en/advanced/best-practice-security.html).
