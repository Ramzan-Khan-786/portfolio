# Responsive behavior and acceptance

Target widths: 320, 375, 390, 430, 768, 1024, 1280, 1536 px. Browser tests additionally check short landscape geometry, theme persistence and mobile navigation.

The public frame uses actual navbar/footer rows and a minmax(0,1fr) central scrolling region within 100dvh. Long pages scroll there; the document does not hide content under fixed overlays. Typography is bounded, grids stack, and long strings wrap. Footer content becomes compact on mobile, preserving explicit route arrows and the scroll preference.

Showroom uses the remaining viewport, not normal page scrolling. Tabs can scroll horizontally inside their container. Metadata compresses on small screens so the interactive frame gets most vertical space. Iframe internal responsiveness belongs to the independent application.

The CMS uses a desktop sidebar and mobile drawer with focus trap/Escape restoration. Tables become readable stacked records at narrow widths. Repeaters and file inputs stay within the form.

Automated checks cover every primary public route and management module, document/central-region overflow, persistent footer position, navigation, theme switching, wheel boundaries/history, reduced motion, auth and CMS/PDF round-trips. Screenshots are stored under artifacts/qa for visual inspection.

Local Chromium checks do not replace Safari/Firefox, real touch hardware, embedded-app responsiveness, browser PDF-viewer, or production-origin testing. See [QA report](QA_REPORT.md) for actual outcomes and remaining limits.
