# Backend

server.js connects to MongoDB before listening; startup failure exits rather than pretending the API is ready. SIGINT/SIGTERM close HTTP connections and disconnect Mongoose. app.js is separate for in-process API tests.

## Request pipeline

1. Disable identifying Express header; set trusted proxy count.
2. Helmet security headers and explicit credentialed CORS.
3. JSON body parsing (256 KiB maximum) and cookies.
4. Database-aware /health endpoint.
5. /api mutation-origin/custom-header checks.
6. no-store responses for auth/admin, auth/admin rate limits.
7. Route authorization, Zod validation, controller, model/service.
8. Central not-found and safe error mapping.

Controllers use validated bodies only. Zod strips unknown object keys, bounds content, validates URLs and IDs, and handles field-specific errors. Mongoose supplies persistence, schema constraints, timestamps, and indexes. Plain text renders escaped in React; no untrusted HTML renderer is used.

The showroom service validates project references and resolves one effective enabled default using a single settings document. Removing a project clears its showroom references; it does not remove the experience itself. This is a small CMS, not a transactional workflow engine.

## Modules

- config/env.js: environment policy and production checks.
- config/database.js: connection lifecycle.
- routes/authRoutes.js: login, session, logout, password change.
- routes/publicRoutes.js: filtered public lists/bootstrap/details.
- routes/adminRoutes.js: authenticated CRUD and dashboard.
- controllers/contentController.js: resource operations and filtering.
- services/seedContent.js: insert-only initial content.
- middleware/errorHandler.js: 400/401/403/404/409/413/422/429/500 responses.
- scripts/seed.js: explicit administrator bootstrap.
- scripts/qa-server.js: isolated browser fixture, development/test use only.

V1 lists are not paginated: they are intended for a personal portfolio, not an unbounded data platform. Rate-limit counters are process-local; a horizontally scaled deployment needs a shared store. API responses never intentionally return password hashes, stack traces, or private setting keys in public bootstrap.

See [API](API.md), [database](DATABASE.md), and [security](SECURITY.md).
