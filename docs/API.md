# API reference

Base path: /api. JSON success is `{ "ok": true, "data": ... }`; failures are `{ "ok": false, "error": { "message": "...", "details": ... } }`. Validation details contain `fieldErrors` keyed by field. DELETE success is 204 with no body.

Authenticated requests send the portfolio_admin cookie. Every POST/PUT/DELETE also sends `X-Portfolio-Request: cms` and JSON Content-Type when a body is present. Browsers use `credentials: "include"`. Do not use a bearer token; this API authenticates its cookie.

## Public and health

| Method | Path                   | Result                                                                                  |
| ------ | ---------------------- | --------------------------------------------------------------------------------------- |
| GET    | /health (outside /api) | 200 when database connected; 503 otherwise                                              |
| GET    | /public/bootstrap      | profile, skills, project summaries, showroom, navigation, socials, allowlisted settings |
| GET    | /public/profile        | Profile or null                                                                         |
| GET    | /public/projects       | Published, nonarchived projects                                                         |
| GET    | /public/projects/:slug | Full public project or 404                                                              |
| GET    | /public/skills         | Visible skills                                                                          |
| GET    | /public/showroom       | Enabled entries, effective default, public project associations                         |
| GET    | /public/navigation     | Enabled navigation records                                                              |
| GET    | /public/socials        | Enabled shared links                                                                    |
| GET    | /public/pages/:slug    | Published simple text page or 404                                                       |

Public setting keys: siteName, siteDescription, footerLine, contactEmail, siteUrl. No public settings or draft-content endpoint exists. Bootstrap omits full project description/screenshots and future action navigation.

## Authentication

| Method | Path           | Body / response                                           |
| ------ | -------------- | --------------------------------------------------------- |
| POST   | /auth/login    | email, password → data.user plus session cookie           |
| GET    | /auth/me       | data.user; 401 absent/expired session                     |
| POST   | /auth/logout   | no body; revokes user's sessions and clears cookie        |
| PUT    | /auth/password | currentPassword, newPassword → new current-session cookie |

User responses contain id, name, email, role only. Logout/password require authorization. Wrong login credentials use a generic 401. Nonadmin users receive 403.

## Admin content

GET /admin/dashboard returns total projects, liveProjects, visible skills, enabled showroom/navigation counts, and five recently updated projects.

GET /admin/profile reads the singleton. PUT /admin/profile accepts name, initials, headline, shortIntro, bio, location, availability, profileImage, resumeUrl, focusAreas, primaryCtaLabel/Url, secondaryCtaLabel/Url.

These resources share one contract:

```text
GET    /admin/{resource}        → list
POST   /admin/{resource}        → 201 created record
PUT    /admin/{resource}/:id    → 200 updated record
DELETE /admin/{resource}/:id    → 204
```

| Resource   | Fields                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| skills     | name, category, description, order, visible                                                                                                                  |
| projects   | title, slug, summary, description, category, imageUrl, screenshots[], technologies[], githubUrl, liveUrl, status, year, featured, published, archived, order |
| showroom   | label, project (ID or null), description, presentationType, embedUrl, externalUrl, status, order, enabled, isDefault                                         |
| navigation | label, destination, type, order, enabled, visibleOnDesktop, visibleOnMobile                                                                                  |
| socials    | label, kind, url, order, enabled                                                                                                                             |
| settings   | key, value (text)                                                                                                                                            |
| pages      | title, slug, description, body, published, order                                                                                                             |

PUT is a full form submission, not a PATCH operation; omitted fields with schema defaults can reset those fields. Send the complete editable record. Unknown properties are stripped. Do not include secrets in Settings.

Example project creation body:

```json
{
  "title": "My engineering project",
  "summary": "A concise description of the actual project.",
  "description": "The complete explanation.",
  "technologies": ["React", "Node.js"],
  "status": "in-progress",
  "published": false,
  "order": 0
}
```

Example live showroom body (replace the illustrative URL with your actual app):

```json
{
  "label": "TypeWriter",
  "project": null,
  "presentationType": "iframe",
  "status": "live",
  "embedUrl": "https://typewriter.example.com",
  "externalUrl": "https://typewriter.example.com",
  "enabled": true,
  "isDefault": true,
  "order": 0
}
```

## Validation and statuses

Safe HTTP(S) URLs only for project/image/embed links; social URLs also allow mailto. Navigation type must match its destination: local /route, #anchor, HTTP(S) external, or disabled future action. Pages cannot claim reserved routes. Order is an integer 0–100000. Project/page slugs are lowercase hyphenated words. Existing project IDs are checked before showroom writes.

Common responses: 400 invalid ID/JSON; 401 unauthenticated; 403 forbidden origin/role; 404 missing record; 409 duplicate key; 413 body too large; 422 invalid fields; 429 rate limit; 500 generic unexpected failure. Unexpected errors do not expose database details or stack traces. See src/validation/schemas.js for exact field limits.
