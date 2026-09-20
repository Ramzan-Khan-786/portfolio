# API reference

Base: /api. Success: `{ok:true,data:...}`. Error: `{ok:false,error:{message,details?}}`; validation details include fieldErrors. DELETE resource success is 204; resume detachment returns updated metadata.

Cookies use credentials:include. Every mutation requires X-Portfolio-Request: cms and a trusted browser Origin when present. JSON requests use application/json; upload uses multipart/form-data with a browser-generated boundary.

## Public

| Method / path                                        | Response                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| GET /health (outside /api)                           | Database-aware 200/503                                                                |
| GET /public/bootstrap | profile, skills, project summaries, showroom, navigation, socials, settings, sections, themeSettings; media refs hydrated |
| GET /public/profile                                  | Shared identity or null                                                               |
| GET /public/projects; /projects/:slug                | Published, nonarchived catalogue/full detail                                          |
| GET /public/skills; /showroom; /navigation; /socials | Visible/enabled content                                                               |
| GET /public/pages/:slug                              | Published plain-text page                                                             |
| GET /public/resume; /resume/current | Resume metadata, hasFile, current version; hidden resumes return visible:false only |
| GET /public/resume/file                              | Current published PDF, inline                                                         |
| GET /public/resume/file?download=1                   | PDF attachment if downloadEnabled; otherwise 403                                      |

GET /theme/settings returns the lightweight normalized public theme policy with no-store headers.

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

All /admin endpoints require database role=admin. GET /admin/dashboard returns actual total/published projects, visible skills, enabled showroom/navigation, registered normal users, resume/media counts, current published version, theme mode, recent projects and latest section update.

GET/PUT /admin/profile manages shared identity (name, initials, headline, shortIntro, bio, location, availability, profileImage, profileMedia, legacy resumeUrl, focusAreas, primary/secondary CTA labels/destinations).

These resources retain list/create/update/delete:

```text
GET    /admin/{resource}
POST   /admin/{resource}
PUT    /admin/{resource}/:id
DELETE /admin/{resource}/:id
```

| Resource   | Editable content                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| skills     | name, category, description, iconUrl/iconMedia, order, featured, visible                                                                                              |
| projects   | title/slug, summary/description, category, imageUrl/screenshots, thumbnailMedia/coverMedia/gallery, technologies, githubUrl/liveUrl, status/year, featured/published/archived, order |
| showroom   | label/project, description, presentationType, embedUrl/externalUrl/githubUrl, technologies, fallbackMessage, previewMedia/iconMedia/fallbackMedia, status/order/enabled/isDefault       |
| navigation | label, destination/type, order/enabled, desktop/mobile visibility                                                                                 |
| socials    | label, kind, url, order/enabled                                                                                                                   |
| settings   | key/value text; never credentials                                                                                                                 |
| pages      | title/slug, description/body plain text, published/order                                                                                          |

GET/PUT /admin/content/:key manages structured sections:

| Key        | Fields                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------- |
| hero       | visible, eyebrow, name, greeting, headline, introduction, imageUrl/imageMedia, imagePosition/imageVisible, actions[{label,url}]                 |
| profile    | visible, title, introduction, currentFocus, education[], highlights[], interests[], achievements[] |
| about      | visible, title/subtitle, heading/body, imageMedia, principles[], experience[]                                  |
| contact    | visible, title/subtitle, heading/description, email/showEmail/showSocials, ctaLabel/ctaUrl, note   |
| footer     | copyright/showCopyright/showSocials, links[{label,url}]                                            |
| appearance | Legacy compatibility only: defaultTheme, followSystem, enabledThemes[]. New policy uses /admin/themes. |

Timeline entries contain title, organization, period, description. Missing records return schema defaults to the editor. PUT replaces the editable section; unknown section fields are rejected.

## Resume, users, operations

- GET/PUT /admin/resume: title, description, visible, downloadEnabled, externalUrl, lastUpdated (YYYY-MM-DD or empty), links[].
- POST /admin/resume/file: compatibility alias for POST /admin/resumes; one multipart file field, PDF up to 5 MB → 201 **draft version**, not published metadata.
- DELETE /admin/resume/file: detach the current pointer/legacy file; does not delete provider assets.
- GET /admin/users?page=1: 25 safe records, total/page/pages. No password hashes or Google subjects.
- PUT /admin/users/:id: {disabled:boolean}; normal users only; revokes their sessions.
- GET /admin/operations: database status, Google/Cloudinary/Drive/logging configuration booleans, uptime, log retention, redacted recent process events.

## Cloudinary media, versions and themes

All endpoints below are under /api/admin and require the existing admin cookie and mutation protection. CMS mutations are serialized by a MongoDB lease; a concurrent operation returns retryable 409. POST media/resume operations additionally have an 80/hour/admin process-local limiter.

| Method / path | Contract |
| --- | --- |
| GET /media/config | Safe configuration/capability flags, upload limits and public Google Picker client configuration; never Cloudinary secrets |
| GET /media | page, category, type=image/document, q, sort=recent/name; 24-item paginated library |
| POST /media | multipart file, category, optional projectSlug; image 8 MB, skill icon 2 MB, PDF 5 MB; resume category requires version endpoint |
| GET /media/:id | Asset metadata plus actual content/version usage |
| GET /media/:id/file | Private PDF preview through the authenticated API |
| PUT /media/:id | displayName, altText, caption, tags[] |
| DELETE /media/:id | JSON {confirm:"DELETE"}; rejects references, deletes provider asset before metadata |
| POST /media/:id/remove-background | Optional account-enabled skill/tech icon transformation; creates a separate asset |
| GET /resumes | page; 20-item version history with derived draft/published/archived status |
| POST /resumes | multipart file, optional title/description; private Cloudinary PDF draft; exact checksum duplicates return 409 |
| POST /resumes/import-drive | fileId, accessToken; fixed Google Drive API fetch; validated PDF becomes a draft |
| POST /resumes/from-library | mediaId of a ready document; copied into a version-owned private asset |
| PUT /resumes/:id | title, description |
| GET /resumes/:id/file | Authenticated version preview; ?download=1 for attachment |
| POST /resumes/:id/previewed | Records the admin viewer acknowledgement |
| POST /resumes/:id/publish | Requires preview acknowledgement and ready asset; switches authoritative current-version pointer |
| POST /resumes/:id/archive | Archives a version; conditionally clears current pointer |
| DELETE /resumes/:id | JSON {confirm:"DELETE"}; active version cannot be deleted |
| GET /themes | Current policy: mode, universalTheme, enabledThemes[], allowVisitorOverride, revision |
| PUT /themes | mode=universal/random-reload/random-daily (legacy random-device normalizes to random-reload), universalTheme in enabledThemes, nonempty curated pool, allowVisitorOverride; server replaces revision |

Managed image fields contain {mediaId, altText, caption}. Server responses hydrate delivery URL/dimensions; clients cannot choose provider IDs or delivery paths. Content saves accept only ready image references. Gallery is an ordered array of at most eight references. Legacy URL fields remain supported without automatic migration. No list of private documents/versions is exposed by public APIs. Theme overrides are document-local, not persisted or sent to the API; each random-reload visit draws once from the enabled pool.

See [media](cloudinary-media-management.md), [resumes](resume-management.md), and [themes](theme-system.md) for workflows and failure semantics. v1.3.0 endpoints are implemented but not runtime-verified in this task.

PUT is a full form submission, not PATCH; schema defaults can reset omitted fields. Existing generic resources strip unknown keys, while new structured/auth schemas reject them. Send complete editable forms.

Statuses: 400 invalid ID/JSON; 401 invalid session/proof/credentials; 403 forbidden role/origin/status; 404 missing content; 409 duplicate identity/slug/key or concurrent change; 413 oversized input; 422 validation; 429 rate limit; 500 safe unexpected failure; 503 unconfigured Google/Cloudinary integrations. See source validation files for exact limits.
