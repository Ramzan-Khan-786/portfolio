# Testing

Run commands from the Portfolio root. Tests must never target your real CMS database. NODE_ENV=test disables .env loading; integration and browser fixtures create ephemeral MongoDB instances with test-only users.

## Fast checks

```powershell
npm.cmd run lint
npm.cmd run format:check
npm.cmd test
npm.cmd run build
```

Backend tests use Supertest against Express with real isolated MongoDB persistence. Coverage includes authorization/role checks, cookies and logout revocation, password changes, CSRF/origin rejection, safe errors, validation, project/navigation CRUD, pages, default showroom fallback, private-data filtering, association cleanup, and seed preservation.

Frontend tests cover showroom URL/empty/unconfigured states, tab defaults/keyboard motion, mobile menu Escape, login errors, populated project selection, server field errors, and image recovery.

## MongoDB test prerequisite

mongodb-memory-server downloads a MongoDB binary on first use, which may be large/slow. Alternatively point to an existing supported installation; the runner starts its own temporary database process and does not require starting your Windows MongoDB service.

```powershell
# Replace with your installed executable.
$env:MONGOMS_SYSTEM_BINARY = 'D:\path\to\mongodb\bin\mongod.exe'
# Only if intentionally using a compatible version differing from the runner default:
$env:MONGOMS_SYSTEM_BINARY_VERSION_CHECK = 'false'
npm.cmd test
```

Allow up to 60 seconds for the isolated process to start on a busy machine. Do not replace a test URI with production credentials to bypass a setup failure.

## Browser-to-database tests

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

For an already installed Chromium, optionally set QA_BROWSER_PATH to its verified executable. Browser cache versions can change; do not hardcode an old cache path.

Playwright starts the isolated API on 5101, an explicitly labelled independent iframe fixture on 5191, and Vite on 5179. Those ports must be free. Test user credentials exist only in the ephemeral QA database and are never read from your .env. Do not run this fixture as a deployed service.

Twenty-three browser checks (eight public viewport cases, eight admin viewport cases, and seven flow cases) verify:

1. Public routes at all eight widths, mobile navigation, iframe interaction, Coming Soon, both switch directions, and 404.
2. Actual CMS login → profile/skill/project/showroom/page/navigation/social writes → MongoDB → public page/detail/default → logout denial.
3. Login and all admin modules/editors at every target width, overflow checks, and drawer focus.
4. Real API failure/retry UI and missing integration behavior.
5. All five themes, persistence and shared auth/CMS appearance.
6. Fresh wheel boundaries, momentum locks, browser history and opt-out.
7. Reduced motion and showroom interaction isolation, including short landscape.
8. User signup/session/admin denial/password change/logout/login.
9. Granular section edits and real PDF upload/download publication through the browser.

Do not edit frontend source or run the formatter while these tests run: Vite HMR can interrupt navigation and invalidate screenshot evidence. Run on a stable checkout. Tests use a single browser worker to avoid data races between scenarios.

## Evidence

- artifacts/qa/*.png: representative screenshots; review them visually.
- playwright-report/index.html: latest browser report.
- test-results/: failure screenshots, context, and retained traces.
- CLI output: current unit/integration, lint, formatting, build results.

Artifacts are ignored by Git. A passing browser fixture proves portfolio integration mechanics, not the real TypeWriter application. The localhost Chromium suite does not prove real HTTPS/CORS/cookie configuration, production deployment health, Safari/Firefox/mobile hardware behavior, or third-party availability.

See [responsive checklist](RESPONSIVE.md) and the latest [verification report](QA_REPORT.md).

## Dependency review

```powershell
npm.cmd --prefix portfolio_backend audit --omit=dev
npm.cmd --prefix portfolio_frontend audit --omit=dev
npm.cmd audit
```

Review advisories before applying updates. Do not use force upgrades as a substitute for compatibility testing.

## New V1 security coverage

The API suite also exercises signup role protection, account suspension, verified-Google new-password/account-linking flows, nonce/expiry/replay rejection, structured CMS validation, PDF header/type/size/active-content checks, download/visibility controls, navigation compatibility and categorized file-log redaction. Google tests mock only the external official token verifier, with the real controller/challenge/database/session path running. They do not prove real Google consent or configured client/origin acceptance.

Frontend component tests exercise all themes and fresh wheel/touch boundary guards, in addition to existing forms/showroom/error cases. Browser tests use generated, explicitly test-only PDF content. Temporary PDF/log artifacts remain under ignored artifacts directories.
