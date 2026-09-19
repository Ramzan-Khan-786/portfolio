# Portfolio V1 verification report

Date: 2026-09-19. Release: 1.2.0. Local Windows / Node 22 / Chromium acceptance, using isolated MongoDB. This report distinguishes automated implementation checks from deployment acceptance.

## Current verified checks

| Check | Result |
| --- | --- |
| Backend schema/API/database tests | 36 passed |
| Frontend component/interaction tests | 20 passed |
| ESLint | Passed |
| Production Vite build | Passed; main entry approximately 223 KB / 72 KB gzip, with lazy route chunks |
| Prettier | Passed |
| Local documentation links | All resolve |
| git diff --check | Passed |
| Root/frontend/backend dependency audits | Zero reported vulnerabilities |
| Final browser regression | In progress: 23 independently timed viewport/flow checks |

The earlier browser pass verified public routes at all eight widths, CMS/database/public round-trips, themes, boundary/history guards, account lifecycle, and resume publication. It exposed a short-landscape showroom sizing issue and an oversized single admin-test timeout. The layout was compacted and responsive sweeps split by viewport; final regression is being rerun.

## Scope

API tests use the real Express controllers, middleware and temporary MongoDB persistence. Coverage includes normal-user/admin separation, cookies/session revocation, signup validation, suspension, Google nonce/expiry/replay and password/linking flow, CMS/project/showroom contracts, structured sections, PDF type/size/parsing/nested active-content rejection, upload/download/detachment, retained bytes, navigation compatibility and log category/redaction.

Google tests mock the external official verifier boundary. Frontend tests explicitly check new portfolio-password copy, existing-password linking (including compatible legacy passwords), failed-completion state, themes, keyboard/menu/form interactions and wheel/touch boundary guards.

Browser scenarios exercise public and admin views at 320, 375, 390, 430, 768, 1024, 1280 and 1536 px; persistent layout and central-region overflow; theme persistence; mobile navigation; iframe interaction/reduced motion; browser history; signup/login/logout/password change/admin denial; granular CMS and generated-PDF round-trips.

## Evidence and isolation

- playwright-report/index.html: current browser report.
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
