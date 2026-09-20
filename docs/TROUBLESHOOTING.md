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

For managed images, check Cloudinary configuration, ready asset state and whether the owning content form was saved after upload. Legacy image fields need direct public HTTP(S) URLs, preferably HTTPS. Check host permissions, mixed-content/CSP policy, and the actual response type. Broken images fall back cleanly; after correcting the CMS URL they can load again.

## Google sign-in

If the UI says not configured, set the backend GOOGLE_CLIENT_ID and restart the API. If the official button fails, verify the web-client authorized origin, popup/FedCM/browser privacy settings and static-host CSP/COOP. An expired/replayed challenge requires starting again. Existing email accounts require their current portfolio password before linking, never their Google password. There is no password-reset email flow in V1.

## Resume

Use a trusted unencrypted PDF up to 5 MB and 50 pages; active forms/scripts/attachments are rejected. Check backend Cloudinary configuration, draft creation and preview acknowledgement before publishing. A successful upload does not change the public version. Identical bytes are rejected: restore the existing version instead. UPLOAD_DIR is read-only legacy compatibility, not the new upload destination.

If PDF.js cannot render, check the matching emitted worker and /pdfjs-assets CMaps/fonts/WASM, proxy PDF response type and static-host CSP; an HTML SPA fallback is not a PDF/asset. External legacy PDFs may reject cross-origin fetch; use Open PDF as the fallback. Missing/pending preview acknowledgement can be retried after the viewer renders.

Drive import needs Picker/Drive APIs, a correctly restricted public API key, project number, OAuth web client and exact authorized origin. Consent may be cancelled/expired. Retry selecting the PDF or download it from Drive and upload locally. Do not paste access tokens into logs or environment files.

## Page navigation and themes

Known legacy anchors route to separate pages. Review customized CMS navigation after upgrading; seed only rewrites the exact old default arrangement. Scroll-to-next-page needs gentle movement at a true boundary and observes a short transition/momentum lock; it is off for reduced motion and visitor opt-out. On Showroom, scroll over the heading/caption/outer chrome; cross-origin iframe input cannot bubble to the portfolio. No additional Showroom scrolling area is intended.

A permitted manual theme choice lasts only until reload. Choose the automatic option to return to the current visit's assignment. Random on every reload stays stable through navigation/focus/policy refresh, then draws again on full reload. With at least two enabled palettes and sessionStorage available, it avoids the last displayed theme. Daily mode follows UTC; fixed mode stays fixed. If every reload is still fixed, explicitly select Random on every reload in Admin → Themes and save. Old per-device policies normalize automatically, but saved fixed/daily policies are intentionally preserved. Policy refresh can take up to a minute or a window-focus event. See [theme system](theme-system.md).

## Cloudinary operations / 409 conflicts

Missing configuration disables new uploads; do not add Cloudinary secrets to VITE variables. Unsupported types, disguised files, oversized images and SVG are rejected. Transparent PNG/WebP is the fallback when background removal is disabled or unavailable. An uploaded-but-unsaved selection is an unused library asset, not a saved content change.

Another CMS mutation may hold the shared database lease. Wait for that operation and retry; do not force-release a live upload lock. Failed deletion keeps retryable metadata, and referenced assets cannot be deleted until their usages are removed. Never manually destroy referenced provider assets to bypass this protection. See [Cloudinary guide](cloudinary-media-management.md).

The current v1.3.0 implementation has not been executed for verification. Troubleshooting steps above are manual operator guidance, not observed successful outcomes.
