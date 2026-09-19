# Environment configuration

Existing .env files are ignored by Git and must not be overwritten during upgrades. Backend dotenv resolves its file relative to the backend module, independent of working directory. Real .env files are not read when NODE_ENV=test.

## Backend

| Variable            | Default / requirement                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| NODE_ENV            | development; use production on the deployed API                                                           |
| PORT                | 5000                                                                                                      |
| MONGODB_URI         | local ramzan_portfolio database; explicitly required in production                                        |
| CLIENT_ORIGIN       | http://localhost:5173; comma-separated allowed browser origins, required in production                    |
| JWT_SECRET          | random ephemeral dev fallback; production requires a non-placeholder secret of at least 32 characters     |
| JWT_EXPIRES_IN      | 8h; duration understood by jsonwebtoken, e.g. 8h or 1d                                                    |
| COOKIE_SECURE       | true in production regardless of this variable; optional true in HTTPS development                        |
| COOKIE_SAME_SITE    | lax; allowed lax, strict, none. none requires secure cookies                                              |
| TRUST_PROXY         | 0; exact trusted proxy-hop count if deployment sits behind proxies                                        |
| SEED_ADMIN_EMAIL    | required by seed, normalized to lowercase                                                                 |
| SEED_ADMIN_PASSWORD | required to create a new admin, at least 12 characters and at most 72 UTF-8 bytes, no example placeholder |
| GOOGLE_CLIENT_ID    | Optional Google Identity Services web client ID; absence disables Google sign-in honestly                 |
| UPLOAD_DIR          | Optional absolute private PDF directory; defaults to backend/uploads/resumes; requires durable storage    |
| LOG_DIR             | Optional absolute private log directory; defaults to backend/logs                                         |
| TYPEWRITER_URL      | optional seed-only HTTP(S) URL; never overwrites existing showroom/project records                        |

Generate a random secret locally, then place the output directly in the backend .env or hosting secret store:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Do not paste secrets into documentation, screenshots, commits, or support logs. Restart the backend after environment changes. Changing JWT_SECRET invalidates existing sessions; ephemeral development secrets change on restart.

## Frontend

| Variable            | Meaning                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| VITE_API_URL        | /api by default; alternatively absolute API base ending in /api             |
| VITE_PROXY_TARGET   | http://localhost:5000; Vite development proxy only                          |
| VITE_TYPEWRITER_URL | optional HTTP(S) fallback for an item linked to the typewriter project slug |

All VITE variables are public and compiled into the browser bundle. Rebuild after changing them. CMS Integration URL takes priority over Full project URL and the build-time fallback.

## Test-only controls

MONGOMS_SYSTEM_BINARY can select an installed mongod executable; otherwise mongodb-memory-server downloads one. MONGOMS_SYSTEM_BINARY_VERSION_CHECK=false allows using a locally installed compatible version rather than its expected default. QA_BROWSER_PATH optionally selects an installed Chromium executable. These are test runner controls, not deployment requirements.

The browser fixture fixes its own origins, credentials and test secret and always creates an isolated database. Never deploy the QA server.
