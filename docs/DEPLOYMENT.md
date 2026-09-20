# Deployment

No deployment, test/build/lint run, dev server, browser automation or provider verification has been performed for v1.3.0. The steps below are operator instructions for later acceptance, not actions completed during implementation. The following is the host-independent release contract; substitute your actual domains, database, and hosting services.

## Build and run

1. Provision a MongoDB database, restricted database user/network access, backups, and server-side secrets.
2. Use Node 22.13+ or a supported newer LTS. Install from the three lockfiles with npm ci in the root and both application directories. Both applications need the repository-level shared directory; do not deploy only a leaf folder without it.
3. Complete the [manual guide](testing/MANUAL_TESTING_GUIDE.md); update historical automated fixtures for Cloudinary draft publication, ten themes and new scroll semantics before relying on them. Run lint, format:check, tests, test:e2e and build as a separate owner-authorized verification pass.
4. Set frontend build variables before building. Publish all of portfolio_frontend/dist, including the PDF.js worker and /pdfjs-assets CMaps, fonts and WASM. Keep those supporting files version-matched; they are emitted by pdfAssetsPlugin.
5. Run the persistent API using `npm --prefix portfolio_backend start`; it connects before listening.
6. Run `npm --prefix portfolio_backend run seed` once with explicit seed credentials if an admin/content does not yet exist. Remove seed passwords from long-lived deployment configuration afterward.
7. Configure HTTPS, routing, origins/cookies, health checks, the Google web client and the actual TypeWriter URL.
8. Configure backend Cloudinary credentials/folder. New files upload to Cloudinary; PDFs use authenticated raw delivery through the API. Keep read-only UPLOAD_DIR storage only for an existing legacy resume until deliberately migrated. Keep LOG_DIR durable or collect logs centrally. Back up MongoDB together with the Cloudinary inventory/asset retention plan; never expose legacy files or logs through generic static middleware.
9. If using Drive import, enable Drive/Picker APIs and configure the OAuth web client, exact origins, restricted Picker API key and project number. Use only a test PDF for initial manual acceptance; imports do not create Google sign-in sessions.

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

V1 limits: process-local rate limiting/event windows, no MFA/account-recovery email/direct-signup email confirmation, client-rendered SEO/404s, read-only legacy PDF compatibility, no antivirus service, and no shared rate-limit store. CMS write serialization uses MongoDB, while Cloudinary/DB recovery is still not a distributed transaction. File audit logs are not tamper-proof central auditing. Address these according to deployment risk.

## Google and document acceptance

Create/configure a Google Identity Services web client, set GOOGLE_CLIENT_ID in the backend, and allow exact browser origins (including ports for local testing). No client secret is needed. Test new-user password creation, returning Google login, existing-local password-confirmed linking, cancel/error/retry and logout.

At the static host, permit the official Google script https://accounts.google.com/gsi/client and required Google frame/connect endpoints in a tested CSP. Include the public API/PDF origin in connect-src and legacy document fallbacks in frame-src; allow the emitted PDF worker via worker-src 'self' and self-hosted supporting fonts/WASM and JavaScript decoder fallback. A restrictive CSP may require 'wasm-unsafe-eval' for WASM decoding; do not broadly enable 'unsafe-eval'. Permit Cloudinary delivery and upload previews in img-src, including blob: previews. Add only the required Google Drive/Picker script/frame/connect origins when enabling import. Validate the resulting CSP alongside the actual embedded-app origin. Use Cross-Origin-Opener-Policy: same-origin-allow-popups where required by Google's popup flow. Preserve the inline theme initializer through a CSP hash/nonce rather than broadly allowing arbitrary scripts.

Manually check Cloudinary PDF publication across API restarts, private draft denial, archive/restore, PDF.js selectable text/search/links and fallback URLs on the real origin topology. Verify missing /pdfjs-assets files return a real asset error rather than HTML. Viewing allows saving a document even when a download button is hidden. Legacy local-file cleanup and Cloudinary asset retention need an explicit backed-up recovery procedure. Newly confirmed permanent deletion is not an archive action.
