# Frontend architecture

## Routes and layout

| Route           | Composition                                                            |
| --------------- | ---------------------------------------------------------------------- |
| /, /home        | Identity, concise introduction, selected work, actual technical counts |
| /profile        | Developer dossier, focus, structured education/highlights/interests    |
| /skills         | Grouped technical ledger                                               |
| /work           | Filterable published project catalogue                                 |
| /work/:slug     | Full project details, images, links                                    |
| /showroom       | Compact selector, viewport-filling independent app, context/actions    |
| /resume         | Professional document access/preview and shared structured background  |
| /about          | Longer narrative, principles, experience                               |
| /contact        | Minimal contact focus and configurable channels                        |
| /login, /signup | Shared-themed email/Google account flows                               |
| /account        | Protected account identity, providers, password change, logout         |
| /admin/*        | Role-protected management workspace                                    |
| /:slug          | Published CMS plain-text page or not-found view                        |

PublicLayout retains the header/footer, with .page-scroll as the only main scrolling region. Its height is the viewport minus the actual header/footer rows. Route changes use 340 ms fade/translation. History restores per-location scroll; backward boundary navigation lands at the preceding page's end.

useBoundaryNavigation never advances while page content can still scroll. A quiet gap of 220 ms, a fresh gesture at the boundary, movement threshold, and 850–950 ms navigation locks limit trackpad momentum/repeated transitions. It ignores form/editable controls, modifier zoom, horizontal gestures and nested scrolling. Touch requires a deliberate vertical swipe starting at the boundary. Footer opt-out persists. Reduced motion disables automatic routing; Showroom opts out entirely.

## State and data

PortfolioProvider handles bootstrap/loading/errors/refresh and stale-request protection. AuthProvider handles me/login/logout/shared user state without browser-stored JWTs. ThemeProvider reads allowed themes/defaults from CMS and persists visitor choice. See [themes](THEMES.md).

lib/api.js owns credentialed fetch, custom mutation header, 12-second timeout, success/error envelope parsing, field errors, and multipart upload support. All mutation success UI follows server acceptance. Unauthorized admin requests clear shared session state.

CMS field descriptors include structured repeaters for actions, timeline entries, and links. Reorder/remove controls edit real array payloads. FormFields generates unique labels/IDs even in nested repeaters.

## Interaction and performance

Showroom, admin, resume, auth and account routes split into lazy chunks. Public bootstrap omits full project descriptions/screenshots. PDF preview mounts only when requested; only the active and briefly outgoing showroom app are mounted. Switching projects can reset embedded-app state.

Semantic landmarks, visible focus, labeled controls, skip link, mobile menu Escape behavior, CMS drawer focus trap, tab keyboard navigation, and reduced-motion overrides are included. Blank API states show loading/empty/error/retry UI; they never invent portfolio records. External images remain URL-based.

Metadata is client-rendered; non-JavaScript social crawlers see index.html defaults. Test browser-specific PDF rendering and real embedded apps separately.
