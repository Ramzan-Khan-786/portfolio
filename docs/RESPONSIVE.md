# Responsive behavior and acceptance

Target widths: 320, 375, 390, 430, 768, 1024, 1280, 1536 px. Include short landscape geometry, visit-only theme selection/reload reset and mobile navigation in manual acceptance. Historical browser tests are not a v1.3.0 pass report.

The public frame uses actual navbar/footer rows and a minmax(0,1fr) central scrolling region within 100dvh. Long pages scroll there; the document does not hide content under fixed overlays. Typography is bounded, grids stack, and long strings wrap. Footer content becomes compact on mobile, preserving explicit route arrows and the scroll preference.

Showroom uses the remaining viewport, not normal page scrolling. Tabs can scroll horizontally inside their container. Metadata compresses on small screens so the interactive frame gets most vertical space. Iframe internal responsiveness belongs to the independent application. Parent heading/caption/chrome wheel gestures can navigate routes without making Showroom scrollable. The iframe itself remains isolated; no overlay captures its input.

The CMS uses a desktop sidebar and mobile drawer with focus trap/Escape restoration. Tables become readable stacked records at narrow widths. Repeaters and file inputs stay within the form.

The [manual checklist](testing/MANUAL_TESTING_GUIDE.md) covers primary public/admin routes, document overflow, persistent footer, all ten themes, media dialogs/galleries, PDF.js controls, gentle wheel boundaries/history, reduced motion, auth and resume publication. No new screenshots, browser tests, builds or lint checks were produced for v1.3.0. Existing artifacts/qa files are historical.

Local Chromium checks do not replace Safari/Firefox, real touch hardware, embedded-app responsiveness, browser PDF-viewer, or production-origin testing. See [QA report](QA_REPORT.md) for actual outcomes and remaining limits.
