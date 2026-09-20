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

PublicLayout retains the header/footer, with .page-scroll as the only main scrolling region. Its height is the viewport minus the actual header/footer rows. Route changes use 420 ms fade/10px translation. History restores per-location scroll; backward boundary navigation lands at the preceding page's end.

useBoundaryNavigation never advances while page content can still scroll. A 36px normalized wheel threshold accumulates gentle input without requiring fast repeated scrolling; a 750ms gap resets accumulation. Initial 420ms and post-navigation 600ms locks plus a 130ms momentum-tail guard limit repeated transitions. It ignores form/editable controls, modifier zoom, horizontal gestures and nested scrolling. Touch requires a 48px predominantly vertical swipe starting at the boundary. Footer opt-out persists. Reduced motion disables automatic routing. Showroom remains viewport-sized and non-scrollable; gestures on its heading/caption/outer chrome can navigate. Its iframe/stage and nested controls remain protected, and cross-origin iframe events do not bubble to the parent.

## State and data

PortfolioProvider handles bootstrap/loading/errors/refresh and stale-request protection. AuthProvider handles me/login/logout/shared user state without browser-stored JWTs. ThemeProvider resolves the shared daisyUI policy from cached settings/bootstrap and the lightweight public endpoint, keeping random assignment/manual overrides in per-document memory only; a full reload starts a fresh visit. themeBootPlugin generates the blocking head initializer from shared functions so React reuses the same initial draw. See [themes](THEMES.md).

lib/api.js owns credentialed fetch, custom mutation header, 12-second timeout, success/error envelope parsing, field errors, and ordinary request handling. lib/media.js owns credentialed XHR upload progress, cancellation, 120-second timeout and client file limits; the backend always revalidates. All mutation success UI follows server acceptance. Unauthorized admin requests clear shared session state.

CMS field descriptors include structured repeaters for actions, timeline entries, and links. Reorder/remove controls edit real array payloads. FormFields generates unique labels/IDs even in nested repeaters. Media and gallery descriptors use shared MediaField/MediaUploader/MediaLibrary components. Uploaded selections remain local until the owning form saves. Dirty-state guards cover regular in-app links and unload, not every browser-history path.

## Interaction and performance

Showroom, admin, resume, auth and account routes split into lazy chunks. Public bootstrap omits full project descriptions/screenshots. The shared lazy PDF.js viewer offers actual text/annotation layers, search and document controls; only the active and briefly outgoing showroom app are mounted. Switching projects can reset embedded-app state.

Semantic landmarks, visible focus, labeled controls, skip link, mobile menu Escape behavior, CMS drawer focus trap, tab keyboard navigation, and reduced-motion overrides are included. Blank API states show loading/empty/error/retry UI; they never invent portfolio records. Managed references resolve to optimized Cloudinary URLs; legacy external image URLs remain fallbacks. Private PDF data is fetched through authorized backend endpoints.

Metadata is client-rendered; non-JavaScript social crawlers see index.html defaults. pdfAssetsPlugin.js serves/emits installed PDF.js CMaps, fonts and WASM; the worker is bundled from the same version. Keep /pdfjs-assets and emitted worker files when deploying. No third-party worker CDN is used.

v1.3.0 was not built or tested during this implementation. Use [manual testing](testing/MANUAL_TESTING_GUIDE.md) to check PDF.js, media forms and navigation. Test browser-specific PDF rendering and real embedded apps separately.
