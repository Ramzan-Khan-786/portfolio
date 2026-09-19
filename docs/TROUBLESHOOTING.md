# Troubleshooting

## Portfolio temporarily unavailable

Check /health and that the API process is running. MongoDB must be reachable before the API listens. Verify VITE_API_URL (including /api), Vite's development proxy target, and CLIENT_ORIGIN. The visitor screen intentionally does not show fabricated fallback content.

## Login fails or immediately returns to login

Use the seeded account, not example credentials. Reseeding does not reset its password. Confirm cookie storage, exact origin, consistent localhost versus 127.0.0.1 usage, HTTPS/Secure, and same-site/cross-site policy. Secret changes, logout, and password changes revoke old sessions. A development server without JWT_SECRET uses an ephemeral secret on every restart.

For password recovery, an authorized database maintenance procedure is needed; V1 has no reset-email API. Do not expose a public reset/seed endpoint or disable authentication.

## 403 on mutation

The API requires X-Portfolio-Request: cms and a permitted Origin. Use the shared frontend API client. For cross-origin browser calls, make sure preflight succeeds and the host forwards required headers. Trust only explicit frontend origins.

## Existing seed changes do not appear

This is intentional: seed does not overwrite CMS edits. Change existing records in the CMS. It can recreate absent starter records, so do not run it continuously as a sync process.

## Showroom is unconnected, blank, or blocked

An empty integration URL shows the preparation state. Enter the real independent application URL and ensure both iframe presentation and live availability. For blank/blocked content, use Having trouble? or Open full project. Check the independent host's frame-ancestors/X-Frame-Options, the portfolio host's frame-src, HTTPS mixed-content restrictions, redirects, cookies, and browser permissions.

A frame load event is not proof of application readiness. The labelled test fixture is not the real TypeWriter service.

## A custom navigation route shows 404

Create and publish its simple Page first. Reserve /work/:slug for projects. Navigation entries do not create arbitrary app features. For deep-link refresh problems on deployment, configure SPA fallback after API/asset routes.

## Tests fail before running application assertions

Install the Playwright browser or point QA_BROWSER_PATH at an existing executable. Check MongoDB binary download access or configure MONGOMS_SYSTEM_BINARY. Free test ports 5101/5179/5191 without stopping unrelated user processes. A local service startup failure is not a successful test.

Avoid changing files during E2E execution; hot reload can abort navigation. After any code patch, rerun the affected tests and final lint/build/format checks.

## Images do not appear

Use direct public HTTP(S) image URLs, preferably HTTPS. Check host permissions, mixed-content/CSP policy, and the actual response type. Broken images fall back cleanly; after correcting the CMS URL they can load again.

## Google sign-in

If the UI says not configured, set the backend GOOGLE_CLIENT_ID and restart the API. If the official button fails, verify the web-client authorized origin, popup/FedCM/browser privacy settings and static-host CSP/COOP. An expired/replayed challenge requires starting again. Existing email accounts require their current portfolio password before linking, never their Google password. There is no password-reset email flow in V1.

## Resume

Use a trusted unencrypted PDF up to 5 MB and 50 pages; active forms/scripts/attachments are rejected. Check writable durable UPLOAD_DIR and private backups. A database record without its corresponding file produces a safe missing-file response. Uploaded PDF takes priority over external URL; remove the current PDF in CMS to use the external fallback. Browser PDF preview is optional; View resume always offers the original.

## Page navigation and themes

Known legacy anchors route to separate pages. Review customized CMS navigation after upgrading; seed only rewrites the exact old default arrangement. Scroll-to-next-page needs a fresh gesture at a boundary and a short transition lock; it is off for Showroom, reduced motion, and visitor opt-out. Local theme choice wins while enabled; reset to Automatic to follow system/CMS policy.
