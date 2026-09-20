# Version history

## 1.3.0 — 2026-09-19 — Cloudinary CMS, resume versions and daisyUI policies

- Centralized new image/PDF uploads in Cloudinary with validated in-memory input, server-owned IDs, metadata, reference checks and recoverable provider-failure handling.
- Added shared browse/drop upload, library picker, previews, metadata/search/filter/sort, confirmed deletion and optional icon background removal.
- Integrated managed Hero/Profile/About/Skills/Projects/gallery/Showroom media while retaining legacy URL fallbacks and saved content.
- Added private resume drafts, duplicate checksum rejection, PDF.js preview, publish/archive/restore/delete, library reuse and optional scoped Google Drive Picker import.
- Bundled one shared PDF.js viewer with text, links, search, page/zoom/fit/fullscreen controls and self-hosted supporting assets.
- Refined admin theme management with mode cards, search/filter/pool presets, isolated previews, discard/save controls and separate workspace appearance. Random mode now draws once per reload; a manual choice lasts until the next reload, without cross-tab persistence.
- Added ten daisyUI palettes, admin universal/random-reload/random-daily policies, visit-only optional visitor overrides and legacy theme mapping.
- Reduced wheel effort and route-motion abruptness. Showroom parent chrome supports previous/next page gestures while staying non-scrollable; embedded application input remains isolated.
- Added CMS write serialization, safe configuration/error/logging paths, dirty-form warnings and comprehensive manual test guides.
- Bumped all package versions/locks to 1.3.0. Actual secrets, live MongoDB data and provider assets were not modified.
- **Implementation-only release:** no tests, lint, builds, servers, browser automation or provider verification were run. Prior QA results do not certify these changes.

## 1.2.0 — 2026-09-19 — page-based portfolio and granular CMS

- Replaced the stacked landing layout with eight distinct persistent-shell views and guarded boundary navigation.
- Added five shared token themes, visitor persistence and CMS appearance controls.
- Enlarged the isolated showroom viewport and added configurable source/technology/fallback data.
- Added a dedicated Resume page, validated PDF upload/detachment, document metadata and shared background content.
- Added granular hero/profile/about/contact/footer editors and structured repeaters.
- Unified normal-user/admin sessions; added signup, verified Google identity flow, mandatory new portfolio password and safe existing-account linking.
- Added user suspension, real dashboard counts, rotating redacted file logs and operational information.
- Expanded isolated API/component/browser tests and updated architecture, configuration and deployment documentation.
- Preserved saved admin credentials/content and documented the targeted legacy-navigation upgrade.

## 1.1.0 — V1 enhancement

- Replaced catch-all landing behavior with proper public/detail/custom-page routes and 404 UI.
- Removed fabricated offline portfolio data and the local imitation typing experience.
- Implemented independent iframe integration, explicit unavailable/help states, accessible tabs, and bidirectional transitions.
- Split CMS into focused resource/form/dashboard/account components with field validation and project dropdowns.
- Added simple text pages for configurable Experience-style routes.
- Hardened cookie authentication, session revocation, password changes, origin checks, URL validation, private-data filtering, and errors.
- Preserved existing seed content/passwords and added isolated MongoDB/browser verification.
- Added lint/format tooling, responsive tests/screenshots, environment guidance, and complete operational documentation.

## 1.0.0 — initial V1 foundation

Initial React/Express/MongoDB structure, public sections, CMS models, navigation/showroom configuration, and basic authentication. Its lightweight checks were insufficient for production acceptance; 1.1.0 replaces the simulated showroom and strengthens those contracts.

V2/V3 remain future planning only. This file records implementation scope, not a claim of a live public deployment.
