# Ramzan Khan — Engineering Portfolio V1

A MERN engineering portfolio with distinct page views, a live-project showroom, ten daisyUI themes, a Cloudinary media CMS, versioned resume publishing, and shared user/admin authentication.

## Experience

Home (`/` or `/home`), Profile, Skills, Work, Showroom, Resume, About, and Contact are separate routes. The navbar and footer remain in the viewport while the current page scrolls between them. A gentle wheel gesture or vertical swipe at the true top/bottom boundary can navigate between enabled portfolio pages. Visitors can disable this behavior; reduced-motion preferences disable it automatically. Showroom stays viewport-sized: scroll on its heading, caption or outer chrome to move between pages. Events inside an independent iframe stay with that application.

Ten curated daisyUI palettes share tokens across public pages, account screens and the CMS. Admin policy supports universal, random-on-reload and deterministic daily selection. Optional visitor choices last only for the current tab visit and reset on reload. The showroom embeds independent applications, not simulated replacements. TypeWriter needs its real embedding-compatible URL; missing integrations show an honest unavailable state.

## Setup

Use Node.js 22.13+ (or a supported newer LTS), npm, and MongoDB. PDF.js requires at least Node 22.13 on the Node 22 line. Run from this directory:

```powershell
npm.cmd ci
npm.cmd --prefix portfolio_backend ci
npm.cmd --prefix portfolio_frontend ci
```

Create each application's `.env` from its example **only if it does not already exist**. Configure the backend database, JWT secret, browser origin, initial administrator credentials and Cloudinary credentials. Google Drive import is optional and has separate Picker/OAuth configuration. Do not overwrite working secrets.

```powershell
npm.cmd --prefix portfolio_backend run seed
npm.cmd run dev
```

Public site: http://localhost:5173 · CMS: http://localhost:5173/admin · API health: http://localhost:5000/health

Seeding preserves existing content and credentials, except that the exact unchanged legacy six-item navigation is upgraded to the eight-page layout. Customized navigation is not rewritten. Missing default records may be inserted/recreated. Back up MongoDB first; do not run seed as a recurring synchronization job.

## Accounts and publishing

- Visitors may browse without an account. Signup and login use a shared HTTP-only cookie session; normal users cannot access admin APIs.
- Google sign-in requires a Google Identity Services web client ID and authorized browser origins. A new Google identity must create a **portfolio password**, never enter its Google password. Existing local accounts must confirm their current portfolio password before linking.
- Admin screens cover Hero, Identity, Profile details, About, Skills, Projects, Showroom, Resume, Contact, Socials, Navigation, Footer, Themes, Settings, Pages, Users, Account, and Operations.
- Media Library supports validated image/PDF uploads, search, metadata, previews and reference-safe permanent deletion. Shared upload/picker fields manage Hero, Identity, About, Skills, Projects and Showroom images.
- Resume PDFs up to 5 MB are private Cloudinary documents: upload/import → draft → PDF.js preview → publish. History supports archive, restore and confirmed deletion. Education/experience/skills/projects remain shared content.
- Optional Google Drive Picker imports PDFs through the backend; Drive is not the delivery/storage backend.
- Backend file logging separates application, HTTP, authentication, admin, and error events with rotation and whitelisted metadata.

Release 1.3.0 is implementation-only: no tests, lint, builds, servers, browser automation, real database migration, provider test uploads or deployment were run for this update. Follow the [manual testing guide](docs/testing/MANUAL_TESTING_GUIDE.md) before release. Existing automated suites/report describe earlier contracts and need updating for Cloudinary drafts, ten themes and the new scroll behavior.

## Commands

| Command                                    | Purpose                                        |
| ------------------------------------------ | ---------------------------------------------- |
| `npm.cmd run dev`                          | API + Vite                                     |
| `npm.cmd run lint`                         | ESLint                                         |
| `npm.cmd test`                             | API/database and frontend component tests      |
| `npm.cmd run test:e2e`                     | Isolated browser → API → MongoDB scenarios     |
| `npm.cmd run build`                        | Production frontend in portfolio_frontend/dist |
| `npm.cmd run format:check`                 | Formatting verification                        |
| `npm.cmd --prefix portfolio_backend start` | Persistent production API                      |

Tests need an installed/downloadable MongoDB binary and Playwright Chromium. See [testing](docs/TESTING.md).

## Architecture and documentation

React 18 + React Router + Vite + Tailwind 3/daisyUI 4 + PDF.js → Express + Zod + Mongoose → MongoDB metadata + Cloudinary media. Public content, cookie-authenticated accounts and role-protected CMS APIs share one backend. New uploads never persist to the API filesystem. Keep legacy PDF storage read-only until deliberately migrated; rotated logs still need durable storage/collection.

- [Frontend setup](portfolio_frontend/README.md) · [Backend setup](portfolio_backend/README.md)
- [Architecture](docs/ARCHITECTURE.md) · [API](docs/API.md) · [Database and upgrades](docs/DATABASE.md)
- [Authentication/security](docs/SECURITY.md) · [CMS](docs/CMS.md) · [Showroom](docs/SHOWROOM.md)
- [Themes](docs/THEMES.md) · [Styling](docs/STYLING.md) · [Responsive behavior](docs/RESPONSIVE.md)
- [Environment](docs/ENVIRONMENT.md) · [Deployment](docs/DEPLOYMENT.md) · [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Cloudinary media](docs/cloudinary-media-management.md) · [Resume management](docs/resume-management.md) · [Theme system](docs/theme-system.md)
- [Manual testing](docs/testing/MANUAL_TESTING_GUIDE.md) · [QA status and historical evidence](docs/QA_REPORT.md) · [V1 specification](docs/versions/V1.md) · [Version history](docs/versions/CHANGELOG.md)

Deploy the static frontend with SPA fallback and the backend as a persistent Node service. Prefer a same-origin /api reverse proxy. Production readiness still requires real HTTPS cookie/Google/iframe checks, backups and restoration, and appropriate monitoring. V2 articles and V3 AI remain future work.
