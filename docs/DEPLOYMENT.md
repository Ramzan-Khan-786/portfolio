# Deployment

No deployment has been made by this implementation. The following is the host-independent release contract; substitute your actual domains, database, and hosting services.

## Build and run

1. Provision a MongoDB database, restricted database user/network access, backups, and server-side secrets.
2. Install from the three lockfiles with npm ci in the root and both application directories.
3. Run lint, format:check, tests, test:e2e, and build before release.
4. Set frontend build variables before building. Publish portfolio_frontend/dist as static files.
5. Run the persistent API using `npm --prefix portfolio_backend start`; it connects before listening.
6. Run `npm --prefix portfolio_backend run seed` once with explicit seed credentials if an admin/content does not yet exist. Remove seed passwords from long-lived deployment configuration afterward.
7. Configure HTTPS, routing, origins/cookies, health checks, the Google web client and the actual TypeWriter URL.
8. Mount private durable storage for UPLOAD_DIR and LOG_DIR. Back up PDFs with MongoDB metadata and monitor disk use; old PDF versions are retained for recovery. Do not expose either directory through generic static middleware.

## Routing and origins

Preferred layout:

```text
https://portfolio.example/         → frontend static files
https://portfolio.example/api/*    → Express /api/*
API service health /health        → Express /health
https://typewriter.example/        → independent embedded application
```

Use VITE_API_URL=/api with this arrangement. Route /api before the SPA fallback; API 404s must remain JSON, not index.html. Rewrite unknown frontend routes to index.html so /work/slug and /admin/showroom survive refresh. Do not rewrite missing asset files to HTML.

For a separate API origin, set the absolute API base (including /api) at frontend build time and allow only your browser origin(s) in CLIENT_ORIGIN. Cookie policies depend on whether domains are same-site. Truly cross-site hosting requires COOKIE_SAME_SITE=none and HTTPS and can still fail where third-party cookies are disabled. A same-origin proxy avoids that dependency.

Production forces secure cookies. Set TRUST_PROXY to the actual number of trusted proxy hops, not an arbitrary permissive value. Serve assets with fingerprint-aware caching, but avoid long immutable caching for index.html. Auth/admin responses already carry no-store.

## Response headers

Helmet secures Express responses; it does not configure your static host. Set frontend headers at the static host/reverse proxy: MIME sniffing protection, a suitable referrer policy, and a tested CSP for your real API/image/frame origins. Permit the real TypeWriter origin in frame-src. Use frame-ancestors on TypeWriter itself to allow the portfolio. Never assume CORS enables iframe embedding.

Do not blanket-disable CSP or remove all iframe protections merely to make a demo load. Account for the data-URL favicon if adopting a restrictive image policy. Test policies in your deployed origin arrangement.

## Release acceptance

- /health is 200 with MongoDB connected.
- Deep-link refresh and unknown-route UI work; API errors remain JSON.
- Login/me/save/logout work in the actual HTTPS cookie topology.
- Copied pre-logout sessions are rejected; invalid origins cannot mutate content.
- Content changes survive API restarts and appear publicly.
- Profile and project links, hosted images/resume, and metadata use real values.
- The actual independent TypeWriter route embeds, accepts typing, resizes, and opens externally.
- Dependency audit and backups are current; restore procedure is tested.

V1 limits: process-local rate limiting/event windows, no MFA/account-recovery email/direct-signup email confirmation, client-rendered SEO/404s, local PDF storage, no antivirus service, and no automatic multi-instance cache or shared file replication. File audit logs are not tamper-proof central auditing. Address these according to deployment risk.

## Google and document acceptance

Create/configure a Google Identity Services web client, set GOOGLE_CLIENT_ID in the backend, and allow exact browser origins (including ports for local testing). No client secret is needed. Test new-user password creation, returning Google login, existing-local password-confirmed linking, cancel/error/retry and logout.

At the static host, permit the official Google script https://accounts.google.com/gsi/client and required Google frame/connect endpoints in a tested CSP. Include the public API/PDF origin in appropriate connect-src/frame-src rules alongside the actual embedded-app origin. Use Cross-Origin-Opener-Policy: same-origin-allow-popups where required by Google's popup flow. Preserve the inline theme initializer through a CSP hash/nonce rather than broadly allowing arbitrary scripts.

Test uploaded PDF persistence after restart, public visibility/download restrictions, fallback links, and the browser's own PDF preview on your real origin topology. Viewing allows saving a document even when a download button is hidden. Old file cleanup needs an explicit retention/recovery procedure.
