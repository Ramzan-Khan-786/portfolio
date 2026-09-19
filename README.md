# Ramzan Khan — Engineering Portfolio V1

A MERN engineering portfolio with distinct page views, a live-project showroom, five themes, a granular CMS, resume publishing, and shared user/admin authentication.

## Experience

Home (`/` or `/home`), Profile, Skills, Work, Showroom, Resume, About, and Contact are separate routes. The navbar and footer remain in the viewport while the current page scrolls between them. A fresh gesture at the true top/bottom boundary can navigate between enabled portfolio pages. Visitors can disable this behavior; reduced-motion preferences disable it automatically. Showroom interaction never triggers route scrolling.

Dark, Light, Midnight, Graphite, and Fieldwork themes share design tokens across public pages, account screens, and the CMS. Theme choice persists locally. The showroom embeds independent applications, not simulated replacements. TypeWriter needs its real embedding-compatible URL; missing integrations show an honest unavailable state.

## Setup

Use Node.js 22, npm, and MongoDB. Run from this directory:

```powershell
npm.cmd ci
npm.cmd --prefix portfolio_backend ci
npm.cmd --prefix portfolio_frontend ci
```

Create each application's `.env` from its example **only if it does not already exist**. Configure the backend database, JWT secret, browser origin, and initial administrator credentials. Do not overwrite working secrets.

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
- Resume uploads accept validated PDFs up to 5 MB. Metadata, links, visibility, and download action are configurable. Education/experience/skills/projects are reused from their content modules.
- Backend file logging separates application, HTTP, authentication, admin, and error events with rotation and whitelisted metadata.

Google and real TypeWriter deployment acceptance require your actual configuration. No live deployment, real database migration, or real resume upload is performed by the automated tests.

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

React 18 + React Router + Vite + Tailwind/component CSS → Express + Zod + Mongoose → MongoDB. Public content, cookie-authenticated accounts, and role-protected CMS APIs share one backend. Private resume files and rotated logs need durable server storage.

- [Frontend setup](portfolio_frontend/README.md) · [Backend setup](portfolio_backend/README.md)
- [Architecture](docs/ARCHITECTURE.md) · [API](docs/API.md) · [Database and upgrades](docs/DATABASE.md)
- [Authentication/security](docs/SECURITY.md) · [CMS](docs/CMS.md) · [Showroom](docs/SHOWROOM.md)
- [Themes](docs/THEMES.md) · [Styling](docs/STYLING.md) · [Responsive behavior](docs/RESPONSIVE.md)
- [Environment](docs/ENVIRONMENT.md) · [Deployment](docs/DEPLOYMENT.md) · [Troubleshooting](docs/TROUBLESHOOTING.md)
- [QA evidence](docs/QA_REPORT.md) · [V1 specification](docs/versions/V1.md) · [Version history](docs/versions/CHANGELOG.md)

Deploy the static frontend with SPA fallback and the backend as a persistent Node service. Prefer a same-origin /api reverse proxy. Production readiness still requires real HTTPS cookie/Google/iframe checks, backups and restoration, and appropriate monitoring. V2 articles and V3 AI remain future work.
