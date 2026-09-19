# API reference

Base: /api. Success: `{ok:true,data:...}`. Error: `{ok:false,error:{message,details?}}`; validation details include fieldErrors. DELETE resource success is 204; resume detachment returns updated metadata.

Cookies use credentials:include. Every mutation requires X-Portfolio-Request: cms and a trusted browser Origin when present. JSON requests use application/json; upload uses multipart/form-data with a browser-generated boundary.

## Public

| Method / path                                        | Response                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| GET /health (outside /api)                           | Database-aware 200/503                                                                |
| GET /public/bootstrap                                | profile, skills, project summaries, showroom, navigation, socials, settings, sections |
| GET /public/profile                                  | Shared identity or null                                                               |
| GET /public/projects; /projects/:slug                | Published, nonarchived catalogue/full detail                                          |
| GET /public/skills; /showroom; /navigation; /socials | Visible/enabled content                                                               |
| GET /public/pages/:slug                              | Published plain-text page                                                             |
| GET /public/resume                                   | Resume metadata, hasFile; hidden resumes return visible:false only                    |
| GET /public/resume/file                              | Current published PDF, inline                                                         |
| GET /public/resume/file?download=1                   | PDF attachment if downloadEnabled; otherwise 403                                      |

Public setting keys: siteName, siteDescription, footerLine (legacy), contactEmail, siteUrl. Full project descriptions/screenshots are omitted from bootstrap. No session internals, resume filename, or Google tokens are returned.

## Shared authentication

| Method / path               | Input → response                                                         |
| --------------------------- | ------------------------------------------------------------------------ |
| POST /auth/signup           | name, email, password → 201 data.user + cookie                           |
| POST /auth/login            | email, password → data.user + cookie                                     |
| POST /auth/admin/login      | Same credentials; additionally requires admin role                       |
| GET /auth/me                | data.user; 401 without a valid session                                   |
| POST /auth/logout           | Revokes all account sessions, clears cookie                              |
| PUT /auth/password          | currentPassword, newPassword → replacement session cookie                |
| POST /auth/google/challenge | configured:false, or configured:true/clientId/nonce + challenge cookie   |
| POST /auth/google           | credential → data.user or step:create/link, email, name + pending cookie |
| POST /auth/google/complete  | password → data.user + ordinary session cookie                           |

Safe user: id, name, email, role, providers. Signup/Google completion do not accept role, email/provider overrides, or user IDs. Password completion is mandatory for new Google identities. Existing local identities require their current password to link.

## Admin content

All /admin endpoints require database role=admin. GET /admin/dashboard returns actual total/published projects, visible skills, enabled showroom/navigation, registered normal users, resume status, recent projects and latest section update.

GET/PUT /admin/profile manages shared identity (name, initials, headline, shortIntro, bio, location, availability, profileImage, legacy resumeUrl, focusAreas, primary/secondary CTA labels/destinations).

These resources retain list/create/update/delete:

```text
GET    /admin/{resource}
POST   /admin/{resource}
PUT    /admin/{resource}/:id
DELETE /admin/{resource}/:id
```

| Resource   | Editable content                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| skills     | name, category, description, iconUrl, order, visible                                                                                              |
| projects   | title/slug, summary/description, category, imageUrl/screenshots, technologies, githubUrl/liveUrl, status/year, featured/published/archived, order |
| showroom   | label/project, description, presentationType, embedUrl/externalUrl/githubUrl, technologies, fallbackMessage, status/order/enabled/isDefault       |
| navigation | label, destination/type, order/enabled, desktop/mobile visibility                                                                                 |
| socials    | label, kind, url, order/enabled                                                                                                                   |
| settings   | key/value text; never credentials                                                                                                                 |
| pages      | title/slug, description/body plain text, published/order                                                                                          |

GET/PUT /admin/content/:key manages structured sections:

| Key        | Fields                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------- |
| hero       | visible, eyebrow, greeting, headline, introduction, imageUrl, actions[{label,url}]                 |
| profile    | visible, title, introduction, currentFocus, education[], highlights[], interests[], achievements[] |
| about      | visible, title/subtitle, heading/body, principles[], experience[]                                  |
| contact    | visible, title/subtitle, heading/description, email/showEmail/showSocials, ctaLabel/ctaUrl, note   |
| footer     | copyright/showCopyright/showSocials, links[{label,url}]                                            |
| appearance | defaultTheme, followSystem, enabledThemes[]                                                        |

Timeline entries contain title, organization, period, description. Missing records return schema defaults to the editor. PUT replaces the editable section; unknown section fields are rejected.

## Resume, users, operations

- GET/PUT /admin/resume: title, description, visible, downloadEnabled, externalUrl, lastUpdated (YYYY-MM-DD or empty), links[].
- POST /admin/resume/file: one multipart file field, PDF up to 5 MB → 201 metadata. Original storage filename is never accepted from the client.
- DELETE /admin/resume/file: detach the current PDF; keep old bytes private for recovery.
- GET /admin/users?page=1: 25 safe records, total/page/pages. No password hashes or Google subjects.
- PUT /admin/users/:id: {disabled:boolean}; normal users only; revokes their sessions.
- GET /admin/operations: database status, Google/logging configuration booleans, uptime, log retention, redacted recent process events.

PUT is a full form submission, not PATCH; schema defaults can reset omitted fields. Existing generic resources strip unknown keys, while new structured/auth schemas reject them. Send complete editable forms.

Statuses: 400 invalid ID/JSON; 401 invalid session/proof/credentials; 403 forbidden role/origin/status; 404 missing content; 409 duplicate identity/slug/key or concurrent change; 413 oversized input; 422 validation; 429 rate limit; 500 safe unexpected failure; 503 unconfigured Google verification. See source validation files for exact limits.
