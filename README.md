# Ramzan Khan — Engineering Portfolio

A MERN portfolio with a responsive public website, a live-project showroom, and a protected content management workspace. React/Vite, Tailwind CSS, Express, MongoDB/Mongoose, and cookie-based administrator sessions.

## V1, enhanced (1.1.0)

- Dedicated Profile, Skills, Work, project detail, Showroom, About, and Contact routes.
- CMS-managed profile/CTAs, skills, published projects, navigation, simple text pages, social links, site metadata, and showroom configuration.
- Independent application embedding with directional project switching, Coming Soon entries, keyboard navigation, and useful failure/retry states.
- Responsive admin forms and lists, project association dropdowns, field validation, dashboard counts, and password changes.
- Server-side authorization, revocable sessions, origin checks, safe URLs, rate limits, and explicit public/private data boundaries.
- API integration tests against an isolated MongoDB, component tests, and browser-to-database tests.

TypeWriter remains a separate application. This repository does **not** contain a replacement typing game. Configure its real embedding-compatible URL in the CMS. Until then the showroom clearly states that the experience is not connected. No invented projects or fallback portfolio are substituted when the API fails.

## Local setup

Use Node.js 22 LTS, npm, and a running MongoDB instance. Clone your own repository and open this directory. Three package-lock files pin the root tooling and both applications.

```powershell
npm.cmd ci
npm.cmd --prefix portfolio_backend ci
npm.cmd --prefix portfolio_frontend ci
```

1. Create `portfolio_backend/.env` from its example **only if it does not already exist**. Set the MongoDB connection, a random JWT secret, allowed browser origin, and initial admin credentials. Never copy examples over working secrets.
2. Create `portfolio_frontend/.env` from its example if needed. Development defaults to the Vite `/api` proxy.
3. Start your local MongoDB or configure an accessible managed database.
4. Seed initial content and an admin, then run both applications:

```powershell
npm.cmd --prefix portfolio_backend run seed
npm.cmd run dev
```

Public: http://localhost:5173 · Admin: http://localhost:5173/admin · Health: http://localhost:5000/health

Seed inserts absent records; it preserves existing records and passwords. It can recreate a deleted initial record if rerun. Edit existing TypeWriter URLs/navigation through the CMS; changing seed configuration does not overwrite them. No default login password is provided.

## Development and checks

| Command from this directory | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `npm.cmd run dev`           | API and frontend together                               |
| `npm.cmd run lint`          | ESLint for application and test code                    |
| `npm.cmd run format:check`  | Prettier validation                                     |
| `npm.cmd run format`        | Format source and documentation                         |
| `npm.cmd test`              | Backend integration/schema and frontend component tests |
| `npm.cmd run test:e2e`      | Isolated API + MongoDB + Chromium browser flows         |
| `npm.cmd run build`         | Optimized frontend in `portfolio_frontend/dist`         |

Browser tests need Playwright Chromium; MongoDB tests need a downloadable or installed MongoDB binary. See [testing](docs/TESTING.md) for setup, reproducible commands, artifacts, and acceptance limits.

## First CMS session

Update Profile & About, review seed skills/project copy, add your real social/contact links, and publish your projects. Under Showroom select TypeWriter, choose `iframe`/`live`, and enter Integration URL and Full project URL. Keep upcoming work `coming-soon`.

To add Experience: create and publish a text page with slug `experience`, then add a Navigation entry pointing to `/experience`. Ordering uses smaller numbers first; visibility is configurable by viewport. These are simple content pages, not a blog or V2 feature platform.

## Deployment and status

Host the frontend build with SPA fallback and run the Express backend as a persistent Node process connected to MongoDB. Prefer a same-origin `/api` reverse proxy. Production requires HTTPS, deployment-specific origins/cookies, backups, and a real TypeWriter acceptance check. No hosting account or live deployment is provisioned by this repository.

The implementation is V1 only. Engineering articles/case studies (V2) and an AI assistant (V3) are documented, not implemented. See [V1 status and limitations](docs/versions/V1.md).

## Documentation

- [Architecture](docs/ARCHITECTURE.md), [frontend](docs/FRONTEND.md), [backend](docs/BACKEND.md)
- [API contracts](docs/API.md), [database](docs/DATABASE.md), [authentication/security](docs/SECURITY.md)
- [Showroom integration](docs/SHOWROOM.md), [CMS guide](docs/CMS.md)
- [Styling ownership](docs/STYLING.md), [responsive QA](docs/RESPONSIVE.md)
- [Environment configuration](docs/ENVIRONMENT.md), [deployment](docs/DEPLOYMENT.md)
- [Testing](docs/TESTING.md), [troubleshooting](docs/TROUBLESHOOTING.md)
- [Version history](docs/versions/CHANGELOG.md), [V2/V3 roadmap](docs/versions/ROADMAP.md)
