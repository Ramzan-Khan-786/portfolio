# Architecture

```text
Public pages / account screens / admin CMS (React)
  → shared /api fetch client with credentials and mutation header
  → Express security, rate limits, role authorization, Zod validation
  → controllers and domain services
  → MongoDB content, users, auth attempts, media references, resume versions, theme policy
  → Cloudinary public images and private authenticated PDF assets
  → private rotating logs (legacy local PDF delivery is read-only)

Showroom → constrained independent-origin iframe (no account/token bridge)
```

MongoDB is the source of truth for content/state; Cloudinary is the persistent store for new CMS media. Public bootstrap contains identity, published project summaries, visible skills, enabled showroom/navigation/socials, allowlisted settings, and page-section overrides. Project details and resume metadata load separately. CMS saves refresh the current tab's public context; there is no realtime push to other visitors.

## Frontend

PublicLayout is a three-row viewport frame: persistent header, independently scrolling route view, persistent footer. Routes are actual React Router pages, not anchor sections in one long landing page. CSS provides 420 ms entry motion. Gentle boundary gestures navigate routes with momentum guards; reduced motion and user opt-out disable this. Showroom outer chrome participates without adding page height, while iframe interaction remains isolated. Browser history retains route scroll positions.

PortfolioProvider, AuthProvider, and ThemeProvider each own one concern. The same AuthProvider serves account and admin routes; roles are enforced again by the API. Admin, showroom, resume, and auth screens are lazy chunks. Tailwind handles routine layout; daisyUI supplies ten theme palettes through a shared catalogue; page/component CSS owns distinctive composition. A shared PDF.js viewer renders public/admin documents with self-hosted supporting assets. Reusable uploader, library picker and media/gallery fields serve all CMS image editors.

## Backend

Public, auth, and admin namespaces preserve the existing contracts. requireAuth checks the cookie signature, expiry, session version, and account status. requireAdmin adds the database role check. Google verification and PDF inspection are services, not browser-trusted claims.

ContentSection adds structured optional overrides without replacing Profile/Project/Skill records. Resume is a keyed singleton pointing to one published ResumeVersion. Versions reference private Cloudinary MediaAssets. Draft upload never publishes; preview acknowledgement precedes publication. MediaAsset usage is scanned before deletion; a MongoDB lease serializes CMS mutations to avoid concurrent content-save/delete races. Cloudinary IDs are server-owned; provider operations include compensation/retry paths but are not distributed transactions. AuthAttempt stores hashed random proofs with expiry, consumed atomically during Google challenge/completion. Logger whitelists event metadata and rotates category files.

## Limits

SPA metadata/404s are client-rendered. Rate-limit counters and recent operational events are process-local. Content lists are bounded editorial datasets, while user management is paginated. New media does not require a shared upload volume. Existing legacy PDFs need their old read-only volume until migrated; logs require durable collection. MongoDB/Cloudinary backups and partial-failure recovery remain operator responsibilities. Implementation status: v1.3.0 has not been built, linted or tested. See the [manual acceptance guide](testing/MANUAL_TESTING_GUIDE.md).

No MFA, password-reset email, direct-signup email confirmation, analytics pipeline, rich HTML editor, antivirus service, or portfolio-to-embedded-app SSO is provided.
