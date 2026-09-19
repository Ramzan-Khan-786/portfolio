# Portfolio API

Persistent Node/Express application using MongoDB/Mongoose, Zod, bcrypt, cookie JWT sessions, Google ID-token verification, validated PDF uploads, and rotated Winston logs.

```powershell
npm.cmd ci
npm.cmd run seed
npm.cmd run dev
npm.cmd test
npm.cmd start
```

Run from this directory. Configure [.env.example](.env.example) without overwriting an existing .env. Seed needs an explicit administrator email/password; it never promotes an existing normal account or resets a saved password. Normal users are created through signup.

Google ID-token login requires GOOGLE_CLIENT_ID only, not a client secret. Add each browser origin to the matching Google web client configuration. The new-user password step and existing-account link confirmation are part of the backend contract.

Resume files default to uploads/resumes; logs default to logs. Both are private and ignored by Git. Use absolute UPLOAD_DIR/LOG_DIR on durable storage in production and back them up. Removing/replacing a resume retains prior bytes privately for recovery; storage cleanup is an operator responsibility.

src/server.js owns startup/shutdown; app.js is reusable in tests. Routes call authorization/validation and controllers; services own Google verification, PDF checks, logging, session issuance, and showroom rules. No secret-bearing body, Google token, or password is logged.

See [backend architecture](../docs/BACKEND.md), [API](../docs/API.md), [database](../docs/DATABASE.md), [authentication/security](../docs/SECURITY.md), [deployment](../docs/DEPLOYMENT.md), and [tests](../docs/TESTING.md).
