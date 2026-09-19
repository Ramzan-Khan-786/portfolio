# Backend architecture

server.js connects to MongoDB before listening and handles SIGINT/SIGTERM, listen failures, uncaught exceptions, and unhandled rejections with bounded shutdown and log flushing. app.js is independent for API tests.

## Pipeline

Request ID/timing → Helmet → explicit credentialed CORS → JSON/cookies → database-aware health → mutation-origin/custom-header checks → no-store auth/admin headers → rate limits → authorization → Zod validation → controller/service/Mongoose → centralized error mapping.

JSON is limited to 256 KiB. Resume multipart uploads are separately limited to one PDF up to 5 MB, after admin authorization. Plain text remains escaped by React; no untrusted HTML rendering.

## Modules

- config: module-relative environment loading, production checks, database lifecycle.
- routes: public, shared auth, and role-protected admin namespaces.
- controllers: content CRUD/filtering, structured sections, resume, auth/Google flow, users/operations.
- services: session issuance, Google verification, recursive PDF inspection, logging, showroom defaults/relations, seed rules.
- models: content, users, Resume, ContentSection, and expiring AuthAttempt records.
- middleware: authentication, request security/logging, validation, safe errors.
- scripts: explicit admin/content seed and an isolated browser-test server.

Google's official server library verifies ID-token signatures/audience/issuer/expiry; the service additionally requires verified email and matching nonce. Only verified profile identifiers are retained, never Google access/refresh/ID tokens. See [security](SECURITY.md).

## Logging and storage

Winston JSON files: combined.log, error.log, http.log, auth.log, admin.log. Each category rotates at 5 MB with five retained files. Metadata is whitelisted; no headers, request bodies, query strings, passwords/hashes, JWTs, or Google tokens are recorded. Request IDs correlate response headers and events. Operations exposes safe configuration/status and the latest 50 non-HTTP events from the current process, not arbitrary file access.

Tests disable default file logging; a dedicated test creates isolated log files to assert category output and redaction. Resume files and logs need durable private storage; prior PDF versions remain private for recovery. PDF validation is not malware scanning.

User lists paginate 25 records; editorial content lists do not paginate. Rate limits and the event window are process-local. Multiple API instances require shared rate-limit infrastructure and shared file storage, plus a log collector.
