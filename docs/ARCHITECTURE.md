# Architecture

```text
Public pages / account screens / admin CMS (React)
  → shared /api fetch client with credentials and mutation header
  → Express security, rate limits, role authorization, Zod validation
  → controllers and domain services
  → MongoDB content, users, single-use auth attempts, resume metadata
  → private filesystem for current/previous PDFs and rotating logs

Showroom → constrained independent-origin iframe (no account/token bridge)
```

MongoDB is the source of truth. Public bootstrap contains identity, published project summaries, visible skills, enabled showroom/navigation/socials, allowlisted settings, and page-section overrides. Project details and resume metadata load separately. CMS saves refresh the current tab's public context; there is no realtime push to other visitors.

## Frontend

PublicLayout is a three-row viewport frame: persistent header, independently scrolling route view, persistent footer. Routes are actual React Router pages, not anchor sections in one long landing page. CSS provides 340 ms entry motion. Boundary navigation requires a fresh gesture and is disabled for reduced motion, user opt-out, and Showroom. Browser history retains route scroll positions.

PortfolioProvider, AuthProvider, and ThemeProvider each own one concern. The same AuthProvider serves account and admin routes; roles are enforced again by the API. Admin, showroom, resume, and auth screens are lazy chunks. Tailwind handles routine layout; page/component CSS owns distinctive composition.

## Backend

Public, auth, and admin namespaces preserve the existing contracts. requireAuth checks the cookie signature, expiry, session version, and account status. requireAdmin adds the database role check. Google verification and PDF inspection are services, not browser-trusted claims.

ContentSection adds structured optional overrides without replacing Profile/Project/Skill records. Resume is a keyed singleton; uploads are UUID-named private files. AuthAttempt stores hashed random proofs with expiry, consumed atomically during Google challenge/completion. Logger whitelists event metadata and rotates category files.

## Limits

SPA metadata/404s are client-rendered. Rate-limit counters and recent operational events are process-local. Content lists are bounded editorial datasets, while user management is paginated. File storage requires a persistent single-service/shared-volume topology. No MFA, password-reset email, direct-signup email confirmation, analytics pipeline, rich HTML editor, image upload service, or portfolio-to-embedded-app SSO is provided.
