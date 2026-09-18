# Verification report — V1 enhancement

Date: 2026-09-18. Workspace: Portfolio. All application work is local; no live deployment or configured CMS database was modified by verification.

## Checks

| Check                              | Result                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------- |
| ESLint                             | Passed                                                                    |
| Prettier                           | Passed, including the final documentation                                 |
| Backend integration + schema tests | 23 passed on Vitest 4.1.11 with isolated MongoDB                          |
| Frontend component tests           | 9 passed on Vitest 4.1.11                                                 |
| Production frontend build          | Passed on Vite 6.4.3                                                      |
| Browser acceptance suite           | 4 passed; final stable run completed in 4.1 minutes                       |
| Dependency advisories              | Zero reported in root, backend, and frontend after the test-runner update |
| Lockfile installation validation   | npm ci --dry-run succeeded for all three packages                         |

The main frontend entry is approximately 67.81 kB gzipped JavaScript and 5.60 kB gzipped CSS, with separate lazy Admin and Showroom chunks. These are build artifact sizes, not a performance benchmark or Lighthouse score.

## Verification scope

API tests exercise real MongoDB persistence with no real .env credentials. Browser scenarios cross the complete CMS UI → authenticated API → MongoDB → public UI boundary. They include public route/detail behavior, published/draft filtering, project associations, default showroom behavior, custom pages/navigation, logout denial, and service failure/retry.

Viewport coverage: 320, 375, 390, 430, 768, 1024, 1280, and 1536 pixels. Public and admin screenshots are retained under artifacts/qa; the browser report is playwright-report/index.html. Both directories are ignored by Git.

Browser-verification guidance led to stronger loaded-state assertions: screenshots wait for actual dashboard/form data, fonts, paint frames, and the controlled iframe. Representative public, showroom, dashboard, and editor layouts were visually reviewed. A prior screenshot captured too early was replaced; a later interrupted navigation during hot reload was not accepted as a passing run.

Additional fixes verified include recovery after correcting a broken image URL, UTF-8 password byte limits, and default CTAs for older saved profiles without rewriting stored content.

## Dependency remediation

The audit identified a development-only Vitest mocker advisory. Vitest was upgraded to the patched 4.1.11 release, retaining the supported Vite 6.4.3 line. Both application manifests override nested Vite to their direct version to avoid npm's conflicting optional-peer resolution. No force audit upgrade or global package replacement was used.

References: [maintainer advisory](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9), [Vitest 4 migration guide](https://v4.vitest.dev/guide/migration).

## Not certified by these checks

- The actual TypeWriter service: no real integration URL is configured. Browser tests use an explicitly labelled independent fixture, not a substitute product.
- Production hosting, actual HTTPS/cookie/CORS topology, database backup/restore, or uptime.
- Physical mobile devices, Safari/Firefox, and TypeWriter's own responsive implementation.
- An independent accessibility/security audit, MFA, distributed rate limiting, or SSR/social-crawler behavior.

Before publishing, enter the real TypeWriter URLs in Showroom, review existing personal content/links, configure deployment security, and perform the actual-origin/device acceptance checklist.
