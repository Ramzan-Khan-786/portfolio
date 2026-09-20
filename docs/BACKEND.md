# Backend architecture

server.js connects to MongoDB before listening and handles SIGINT/SIGTERM, listen failures, uncaught exceptions, and unhandled rejections with bounded shutdown and log flushing. app.js is independent for API tests.

## Pipeline

Request ID/timing → Helmet → explicit credentialed CORS → JSON/cookies → database-aware health → mutation-origin/custom-header checks → no-store auth/admin headers → rate limits → authorization → Zod validation → controller/service/Mongoose → centralized error mapping.

JSON is limited to 256 KiB. Media multipart uploads allow one file after admin authorization: general images up to 8 MB, skill icons 2 MB, PDFs 5 MB. Sharp decodes/re-encodes allowed images; PDF validation parses 1–50 pages and rejects active content. No file is permanently written to local storage. Plain text remains escaped by React; no untrusted HTML rendering.

## Modules

- config: module-relative environment loading, production checks, database lifecycle.
- routes: public, shared auth, and role-protected admin namespaces.
- controllers: content CRUD/filtering, structured sections, media, versioned resume, themes, auth/Google flow, users/operations.
- services: session issuance, Google verification, Cloudinary validation/upload/delivery, reference inspection, resume versions/Drive import, recursive PDF inspection, logging, showroom defaults/relations, seed rules.
- models: content, users, Resume/ResumeVersion/MediaAsset/ThemeSettings, ContentSection and expiring AuthAttempt records.
- middleware: authentication, request security/logging, database-backed CMS mutation lease, validation, safe errors.
- scripts: explicit admin/content seed and an isolated browser-test server.

Google's official server library verifies ID-token signatures/audience/issuer/expiry; the service additionally requires verified email and matching nonce. Only verified profile identifiers are retained, never Google access/refresh/ID tokens. See [security](SECURITY.md).

## Logging and storage

Winston JSON files: combined.log, error.log, http.log, auth.log, admin.log. Each category rotates at 5 MB with five retained files. Metadata is whitelisted; no headers, request bodies, query strings, passwords/hashes, JWTs, or Google tokens are recorded. Request IDs correlate response headers and events. Operations exposes safe configuration/status and the latest 50 non-HTTP events from the current process, not arbitrary file access.

Existing tests disable default file logging; their old local-file resume assumptions need revision before v1.3.0 execution. No tests were run for this task. New resume bytes live in authenticated Cloudinary raw assets, streamed through the API only for an authorized preview or the current visible public version. Legacy UPLOAD_DIR remains read-only. Logs still require durable storage/collection. PDF validation is not malware scanning.

User lists paginate 25 records, media 24 and resume versions 20; editorial content lists do not paginate. Rate limits and the event window are process-local. Multiple API instances require shared rate-limit infrastructure and a log collector. Cloudinary removes the new-upload volume requirement; legacy PDFs still need shared/readable storage until migrated. The CMS write lease is shared through MongoDB, independent of process-local rate limits.

Cloudinary/provider calls have bounded timeouts and private PDFs have bounded downloads. Upload failures after provider success attempt compensation; deletion failures retain retryable metadata. This is not an atomic cross-provider transaction. See [media](cloudinary-media-management.md), [resumes](resume-management.md) and [manual acceptance](testing/MANUAL_TESTING_GUIDE.md).
