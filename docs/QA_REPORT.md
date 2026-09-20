# Portfolio V1 verification report

## Current release 1.3.0 — NOT TESTED

Cloudinary media, versioned resumes/Drive/PDF.js, daisyUI policies and smoother route gestures are implemented with source-only review. The follow-up theme-control redesign and random-on-reload/visit-only override behavior are also source-reviewed only; no executable checks were performed. Per the implementation brief, no tests, lint, builds, servers, browser automation, live database changes or provider test uploads were run for this release. Dependencies were installed with package scripts disabled; that is not runtime verification.

No actual .env values were inspected or changed. No automatic asset/content migration or deletion was performed. Cloudinary credentials, optional Drive setup and all runtime/manual acceptance remain owner tasks. Follow [MANUAL_TESTING_GUIDE](testing/MANUAL_TESTING_GUIDE.md). Existing automated fixtures also need adaptation to the new contracts before their results can certify this release.

The saved browser report and all pass counts below are **historical v1.2.0 evidence only**, preserved without rerunning. They do not verify v1.3.0 or establish production readiness.

## Historical release 1.2.0 evidence

Date: 2026-09-19. Release: 1.2.0. Local Windows / Node 22 / Chromium acceptance, using isolated MongoDB. This report distinguishes automated implementation checks from deployment acceptance.

## Historical verified checks (1.2.0 only)

| Check                                               | Result                                                                                              |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Backend schema/API/database tests                   | 36 passed                                                                                           |
| Frontend component/interaction tests                | 20 passed                                                                                           |
| ESLint                                              | Passed                                                                                              |
| Production Vite build                               | Passed; main entry approximately 223 KB / 72 KB gzip, with lazy route chunks                        |
| Prettier                                            | Passed                                                                                              |
| Local documentation links                           | All resolve                                                                                         |
| git diff --check                                    | Passed                                                                                              |
| Root/frontend/backend dependency audits             | Zero reported vulnerabilities                                                                       |
| Full browser regression                             | 23 passed; zero failed, flaky or skipped                                                            |
| Follow-up browser checks after heading/footer edits | 5 passed: 320/390/1536 px public layouts, wheel/history and reduced-motion/short-landscape showroom |

The full browser regression verified public and admin routes at all eight widths, CMS/database/public round-trips, themes, boundary/history guards, account lifecycle, and resume publication. The short-landscape showroom sizing issue was fixed, and responsive sweeps were split by viewport to avoid an oversized single-test timeout. The saved HTML report confirms all 23 checks passed.

Later local heading/footer edits were preserved and checked with five focused browser scenarios. The unused heading prop and PDF-validation catch binding were removed without changing runtime behavior. A separate browser session confirmed Home renders without page errors; its screenshot was visually inspected. The full HTML report was preserved while follow-up results were written separately.

The first follow-up component run timed out while starting a thread worker. Rerunning with `npm.cmd --prefix portfolio_frontend test -- --pool=forks --maxWorkers=1 --no-file-parallelism` completed all 20 tests without errors. This was a runner-startup issue, not a skipped test.

## Scope

API tests use the real Express controllers, middleware and temporary MongoDB persistence. Coverage includes normal-user/admin separation, cookies/session revocation, signup validation, suspension, Google nonce/expiry/replay and password/linking flow, CMS/project/showroom contracts, structured sections, PDF type/size/parsing/nested active-content rejection, upload/download/detachment, retained bytes, navigation compatibility and log category/redaction.

Google tests mock the external official verifier boundary. Frontend tests explicitly check new portfolio-password copy, existing-password linking (including compatible legacy passwords), failed-completion state, themes, keyboard/menu/form interactions and wheel/touch boundary guards.

Browser scenarios exercise public and admin views at 320, 375, 390, 430, 768, 1024, 1280 and 1536 px; persistent layout and central-region overflow; theme persistence; mobile navigation; iframe interaction/reduced motion; browser history; signup/login/logout/password change/admin denial; granular CMS and generated-PDF round-trips.

## Evidence and isolation

- playwright-report/index.html: historical saved browser report.
- artifacts/qa/latest-ui-tests/.last-run.json: follow-up browser result after local UI edits.
- artifacts/qa/latest-home.png: manually inspected follow-up Home screenshot.
- artifacts/qa: public, showroom, CMS and theme screenshots.
- test-results: failed-run screenshots/context/traces, if any.
- artifacts/tests: isolated PDF/log test outputs.

Screenshots of Home and Showroom at mobile widths, the mobile dashboard, and Midnight theme were visually inspected. The iframe fixture and generated resume are explicitly test-only content, not a claim about the actual TypeWriter app or a professional resume.

No real .env values were changed or exposed. Tests never connect to the configured portfolio database. No live seed, migration, deployment, message or external account change was performed. Legacy default navigation migration is available through the documented seed procedure; customized navigation needs deliberate owner review.

## Remaining deployment acceptance

- Configure and verify the real Google web client, authorized origins, consent/popup/FedCM and HTTPS cookie topology.
- Supply and test the actual independent TypeWriter URL and its frame policy.
- Publish the owner's real resume and content; confirm file persistence/backup/restoration on durable storage.
- Verify production CSP/proxy/health/monitoring and HTTPS login/logout behavior.
- Test Safari/Firefox, real mobile touch hardware and native PDF rendering. Local Chromium is not a cross-browser certification.
- PDF validation is not antivirus; download hiding is not DRM; file logs are not centralized tamper-proof auditing.

No production-ready deployment claim is made solely from passing local tests.
