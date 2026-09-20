# Portfolio API

Persistent Node/Express application using MongoDB/Mongoose, Zod, bcrypt, cookie JWT sessions, Google ID-token verification, Cloudinary image/private PDF storage, versioned resumes, and rotated Winston logs.

```powershell
npm.cmd ci
npm.cmd run seed
npm.cmd run dev
npm.cmd test
npm.cmd start
```

Run from this directory. Configure [.env.example](.env.example) without overwriting an existing .env. Seed needs an explicit administrator email/password; it never promotes an existing normal account or resets a saved password. Normal users are created through signup.

Google ID-token login requires GOOGLE_CLIENT_ID only, not a client secret. Add each browser origin to the matching Google web client configuration. The new-user password step and existing-account link confirmation are part of the backend contract.

All new CMS files are validated in memory and uploaded through services/cloudinary; MongoDB stores metadata and references. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the backend only. Keep the repository-level shared directory with the API because theme validation imports shared/themes.js.

UPLOAD_DIR is now read-only compatibility storage for a previously published local PDF; do not delete it until deliberately re-uploading/publishing and backing it up. LOG_DIR still owns private rotating logs. Back up MongoDB together with a Cloudinary asset inventory. A single MongoDB CMS lease serializes mutations; a concurrent save receives a retryable 409.

Use Node 22.13+ across the repository. The commands above are operator instructions, not checks performed for 1.3.0. Start with the [manual testing guide](../docs/testing/MANUAL_TESTING_GUIDE.md).

src/server.js owns startup/shutdown; app.js is reusable in tests. Routes call authorization/validation and controllers; services own Google verification/Drive import, Cloudinary delivery, image/PDF checks, media references, resume publication, logging, session issuance and showroom rules. No secret-bearing body, Google token, or password is logged.

See [backend architecture](../docs/BACKEND.md), [API](../docs/API.md), [database](../docs/DATABASE.md), [authentication/security](../docs/SECURITY.md), [deployment](../docs/DEPLOYMENT.md), and [tests](../docs/TESTING.md).
