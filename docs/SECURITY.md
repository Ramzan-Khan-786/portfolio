# Authentication and security

## One session system, two roles

Direct signup validates name/email/password and explicitly creates role=user. Administrator accounts are created only through the private seed procedure; existing admins keep their stored role/password. Seeding refuses to promote a normal account whose email matches the requested administrator.

Passwords use bcrypt cost 12. New passwords require 12 characters and at most 72 UTF-8 bytes. Login accepts existing compatible passwords, uses a dummy comparison for unknown accounts, and returns a generic credential error. Suspension invalidates sessions and blocks authentication.

The legacy-named portfolio_admin cookie now serves both roles for compatibility. It is HTTP-only, scoped to /api, secure in production, and SameSite-configurable. HS256 JWTs contain subject, session version, expiry, issuer portfolio-api, and the retained audience portfolio-admin. Every protected request checks the database account/status/version; role claims supplied by clients are never trusted.

Logout increments sessionVersion and clears the cookie, revoking all sessions. Password changes verify the current password, update the hash/version, and issue a replacement cookie for the current session. No JWT is stored in localStorage. No password-reset or email-confirmation delivery service is implemented.

## Google flow

1. POST /auth/google/challenge creates a short-lived random nonce, stores its hash/expiry in MongoDB, and sets an HTTP-only challenge cookie.
2. The official GIS button includes the nonce in its ID-token request. The browser posts the credential over the protected JSON API.
3. The official Google server library verifies signature, audience, issuer and expiry. The service additionally requires email_verified and an exact nonce match, then atomically consumes the challenge.
4. A known googleId signs in using its stable subject. An unlinked existing email requires the current portfolio password. A new identity must create a new **portfolio account password**, never provide a Google password.
5. Completion uses an opaque HTTP-only pending cookie backed by a hashed, expiring, single-use MongoDB record. Verified profile data is server-owned; email/role/provider claims are not accepted from the completion request.
6. Completion consumes the proof, checks existing account version/status when linking, hashes a new password when creating, and issues the normal session cookie. Unique email and sparse unique googleId indexes prevent duplicate accounts.

Invalid, expired, unverified, mismatched, or replayed challenges fail. Google tokens are not persisted or logged. This is a JavaScript callback flow protected by custom-header preflight, exact Origin checks, and server nonce binding; it is not a redirect endpoint accepting unverified Google POST bodies.

Set GOOGLE_CLIENT_ID to a Google Identity Services web client ID and configure authorized JavaScript origins. No client secret is required for this ID-token flow. Test the real Google consent/popup/FedCM behavior on the deployed origins. Automated tests mock the external verifier boundary, not real Google sign-in.

References: [Google server verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token), [GIS JavaScript reference](https://developers.google.com/identity/gsi/web/reference/js-reference).

## Request and content defenses

- Explicit credentialed CORS origins; every mutation requires X-Portfolio-Request: cms. Untrusted Origin and cross-site requests without Origin are rejected.
- Login/admin login/signup: 15 requests per 15 minutes/IP; password: 10; Google namespace: 40, completion additionally 15; admin namespace: 500.
- Auth/admin responses are no-store. URLs reject unsafe schemes, credentials and protocol-relative destinations. Page slugs cannot override system routes.
- Public APIs filter drafts/private settings. Showroom references never expose unpublished project details.
- Central errors use predictable status/envelopes without production stack traces. Logs whitelist only safe event metadata.

## Resume safety

Administrator-only multipart upload requires PDF extension/MIME/header and successful parsing, 1–50 pages, and at most 5 MB. Recursive object inspection rejects scripts, actions, forms and embedded attachments. UUID filenames are generated server-side; no client-controlled storage paths are accepted. Public access serves only the current published file with PDF MIME, no-store, nosniff, controlled disposition and restricted frame policy.

Validation is not antivirus. Only upload trusted documents; add malware scanning if accepting uploads from less-trusted roles in the future. A viewable PDF can always be saved by the visitor: disabling the download action is not DRM. Removing/replacing a PDF keeps old bytes private for operator recovery.

## Deployment responsibilities

Use HTTPS, explicit proxy trust, restricted MongoDB access, durable storage/backups, current dependencies and monitoring. Process-local limits/log windows are not a distributed security system. MFA, account recovery/email verification, abuse moderation, hardware/browser acceptance and live Google/TypeWriter verification remain outside automated local acceptance.
