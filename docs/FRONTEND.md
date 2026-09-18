# Frontend

## Routing

| URL                 | Screen                                                                     |
| ------------------- | -------------------------------------------------------------------------- |
| / and /profile      | Profile landing, selected work, showroom invitation, skills, about/contact |
| /skills             | Grouped skills                                                             |
| /work               | Published, nonarchived catalogue                                           |
| /work/:slug         | Full project details, optional screenshots and links                       |
| /showroom           | Project selector and independent embedded experience                       |
| /about and /contact | Dedicated sections                                                         |
| /:slug              | Published CMS text page; unavailable slug gets a 404 view                  |
| /admin/*            | Protected workspace and section routes                                     |
| other paths         | Not-found page                                                             |

SiteHeader and SiteFooter are shared by public routes. Metadata updates document title, description, Open Graph title/description, and optional canonical from the siteUrl setting. Metadata is client-rendered; social crawlers that do not run JavaScript only see index.html defaults.

## Data and state

PortfolioProvider fetches /public/bootstrap once at initialization. Request sequence tracking prevents an old request from replacing newer content. It exposes content, status, sourceError, and refresh. Failure shows a retry screen instead of invented data.

lib/api.js is the single fetch boundary: credentials, custom request header, 12-second timeout, response envelope parsing, and friendly errors. An unauthorized admin-resource request emits session-expired and the shell returns to login. No JWT is stored in browser JavaScript or localStorage.

CMS state is local to each form; resource descriptors specify labels, types, defaults, and columns. toForm converts populated project objects to IDs; toPayload parses arrays/number fields. Save errors retain edits and show server field errors. Mutations refresh lists and public data. There is no Redux dependency or unrelated state framework.

## Interaction and accessibility

Semantic headings, form labels, error descriptions, explicit button names, visible focus, skip navigation, and keyboard-controlled showroom tabs are provided. The mobile CMS drawer traps focus while open and supports Escape. Public mobile navigation closes on route selection/Escape. Reduced motion removes decorative movement.

ContentLink accepts safe local, HTTP(S), or email destinations; new-tab links use noopener/noreferrer. ContentImage handles broken URLs without broken-image chrome. Long text wraps. Images are URL-based, not uploaded through the portfolio.

Showroom and AdminApp are lazy chunks. Bootstrap excludes full project descriptions/screenshots; detail routes fetch them separately. Only the active iframe and, during a 480ms transition, the outgoing iframe are rendered. Switching away ends that embedded session; returning loads it again.

See [styling](STYLING.md), [responsive behavior](RESPONSIVE.md), and [showroom](SHOWROOM.md).
