# Manual testing guide — V1.3

**Not executed by Codex.** This is your checklist, not a test result. No tests, builds, lint, servers, browser automation, API calls, provider uploads or database checks were run for this implementation.

Record environment, date, browser/device, steps, expected/actual results and redacted evidence for each case. Never include cookies, credentials, access tokens, signed private delivery URLs or personal resume content in screenshots/logs.

## Prerequisites and safe setup

1. Back up your existing MongoDB data and legacy PDFs. Use a separate local/staging database and Cloudinary root folder for acceptance.
2. Install Node 22.13+ (PDF.js package requirement), npm, MongoDB and the dependency lockfiles. The shared/ directory must remain alongside both applications.
3. In a terminal at Portfolio, run the following yourself:

```powershell
npm.cmd ci
npm.cmd --prefix portfolio_backend ci
npm.cmd --prefix portfolio_frontend ci
```

4. Compare backend .env.example with your .env without overwriting it. Set MONGODB_URI, a stable JWT_SECRET, CLIENT_ORIGIN and port/cookie settings. No real secrets are supplied by this change.
5. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET; choose a separate CLOUDINARY_FOLDER for testing. Leave background removal disabled until you intentionally enable a supported account capability.
6. Cloudinary PDFs are authenticated raw assets. Review account PDF delivery and strict transformation settings yourself. Do not make drafts public to bypass a delivery error.
7. Optional Google login: GOOGLE_CLIENT_ID with exact authorized frontend origins. Optional Drive import: GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_API_KEY and numeric GOOGLE_DRIVE_APP_ID; enable Drive/Picker APIs, consent/test users and restricted browser key. See [resume setup](../resume-management.md).
8. Frontend .env normally uses VITE_API_URL=/api and VITE_PROXY_TARGET=http://localhost:5000. Cloudinary credentials do not belong in VITE variables.
9. Existing admins need no reseed. For a genuinely new staging DB, configure SEED_ADMIN_EMAIL/PASSWORD and deliberately run the documented seed once. It can insert missing defaults; do not run it against production without reviewing its scope.
10. Start the backend and frontend yourself, in separate terminals:

```powershell
npm.cmd --prefix portfolio_backend run dev
npm.cmd --prefix portfolio_frontend run dev
```

Alternatively use the existing root dev command. Open the frontend port printed by Vite and /admin. Confirm CLIENT_ORIGIN matches the actual browser origin, including port. Do not point test fixtures at real data.

## Recommended order

1. [Admin and permissions](ADMIN_CMS_TESTING.md)
2. [Cloudinary uploads and media reuse](CLOUDINARY_TESTING.md)
3. [Resume lifecycle and viewer](RESUME_TESTING.md)
4. [Themes and reload/daily policy](THEME_TESTING.md)
5. [Full regression, including gentle Showroom scrolling](REGRESSION_CHECKLIST.md)
6. Manually restart backend and frontend; repeat persistence cases.
7. Only after local acceptance, perform your own production build/deployment and repeat HTTPS/CSP/cookie/provider checks. No deployment/build result is supplied here.

## Fixtures to prepare yourself

- Small JPEG, opaque PNG, transparent PNG/WebP, oversized image, animated file, and text file renamed .jpg.
- Trusted text-based PDF with multiple pages and HTTP links; second different PDF; identical copy; image-only scanned PDF; empty/corrupt/encrypted/oversize PDF.
- Staging admin and normal-user accounts. Two browser profiles/devices and mobile/landscape widths.
- A PDF accessible through the configured Google Drive account, if you enable that integration.

Use only non-sensitive fixtures. Do not generate or distribute malicious PDF payloads to exercise rejection; use known safe security fixtures in an isolated environment if needed.

## Result template

Case ID:
Environment/browser:
Expected:
Actual:
Evidence:
Notes:

- [ ] Pass
- [ ] Fail
- [ ] Needs investigation

Leave every case unchecked until you actually execute it. A failed case should record the first broken boundary: browser UI, request, API validation, Cloudinary, MongoDB or public rendering. Do not expose request secrets when collecting evidence.

## Troubleshooting starting points

- 401/403: session, admin role, cookie topology, exact allowed origin, mutation header.
- 409 busy: another CMS mutation owns a lease; retry shortly. After a crashed process, allow up to three minutes.
- 413/422: category/type/size, real file format, PDF encryption/pages/active content, invalid reference.
- 502/503: Cloudinary configuration, account delivery capability/quota/network; Drive access/configuration.
- Blank PDF: worker/font/WASM routes must return the correct files, not SPA HTML. Inspect the browser yourself.
- Cancelled/timeout upload: inspect the library/versions before retrying; the backend may already have stored it.
