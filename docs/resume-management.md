# Resume management — V1.3

Implementation complete; manual testing required. No real resume was uploaded or published during implementation.

## Lifecycle

Upload PDF → validate → private Cloudinary raw object → ResumeVersion draft → open PDF preview → publish.

Uploads never auto-publish. SHA-256 duplicate detection returns 409 identifying the existing version. A library document or Google Drive PDF uses the same validation/storage/version pipeline. Library import creates a separately owned version object; deleting the original document cannot remove the resume.

Resume retains page settings and a single currentVersion pointer. ResumeVersion stores version, media reference, checksum, title/description, original filename, byte/page counts, source, uploader and timestamps. Status is derived from this authoritative pointer plus archive/history metadata; it is not an independently maintained published boolean.

Publishing requires preview acknowledgement and atomically switches the pointer. The prior version is therefore archived without a multi-document publication race. Publishing an archived version is rollback: no re-upload. Archive removes the pointer if necessary and retains the PDF. Delete rejects the active version and requires permanent-deletion confirmation. Provider/DB partial failure leaves retryable metadata rather than pretending success.

Public visibility and download controls are independent page settings. A hidden page stays hidden even after publishing; enable visibility deliberately. Public reads expose only the current version and safe metadata, never a draft's provider URL.

## Editor and viewer

Admin → Resume includes local browse/drop, upload progress, Drive import, library selection, paginated versions, metadata editing, preview, publish, archive, restore/publish and permanent delete.

Both admin and public /resume use the same lazy ResumeViewer with PDF.js: actual PDF rendering, selectable text, link annotations, text search/highlighting, match navigation, page number/previous/next, zoom, fit width, loading/error states, fullscreen and original/download actions. Search needs an actual text layer; image-only scans are not OCR. Forms, scripts and XFA are not enabled.

PDF.js worker, CMaps, standard fonts, WASM files and JavaScript decoder fallbacks are hosted with the frontend via pdfAssetsPlugin.js, not a version-mismatched CDN worker. Keep the complete dist output when the owner builds it. Serving missing worker/font/WASM files as index.html will break rendering.

## Public API

- GET /api/resume/current (alias of GET /api/public/resume): current page metadata, visible, hasFile, version, pageCount, storage and size.
- GET /api/public/resume/file: the current published file only.
- GET /api/public/resume/file?download=1: attachment if downloadEnabled.
- GET /api/admin/resumes/:id/file: authenticated version preview/download.

The backend downloads the signed authenticated Cloudinary raw PDF, applies size/time bounds and sends controlled PDF headers. It does not expose signed draft URLs. The public endpoint is no-store, so a newly published version does not require redeployment.

Disabling a download button is not DRM: anyone allowed to view a PDF can save it.

## Optional Google Drive import

Configure GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_API_KEY and GOOGLE_DRIVE_APP_ID in the backend. The client ID and restricted Picker API key are public configuration, not secrets. Cloudinary secrets stay server-side.

Use one Google Cloud project, enable Drive API and Picker API, configure OAuth consent/test users and authorized frontend JavaScript origins. App ID is the numeric project number. Restrict the browser API key by actual frontend referrers and required APIs. Google login's GOOGLE_CLIENT_ID and Drive authorization serve different purposes; both can use appropriately configured clients.

GIS requests only drive.file on an explicit click. Picker limits selection to PDFs. Its short-lived access token exists only in memory and one admin-only import request; no refresh token, browser storage or DB token record is created. The backend fetches only a validated file ID through fixed Google API URLs, rejects redirects/oversize/non-PDF content and then uses the common upload service. Google Docs must first be exported to PDF. A Drive sharing URL is never the canonical resume.

Cancel/denied/expired consent and missing configuration retain local upload as a fallback. No Drive account, consent configuration or real import was exercised by Codex.

References: [Google Picker](https://developers.google.com/workspace/drive/picker/guides/overview), [GIS token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model), [PDF.js](https://mozilla.github.io/pdf.js/examples/).

## Legacy compatibility

Existing UUID-named local PDFs are read-only fallbacks. New uploads never write to UPLOAD_DIR. Re-upload a trusted original, preview and publish it to switch the canonical pointer to Cloudinary. Old bytes are not automatically deleted. After backing up and manually checking migration, the operator may retire the legacy volume deliberately.

External resume URLs remain fallback links when no current file is published. Clear those URLs if archiving must leave no public document. Third-party PDF.js fetches may be blocked by that host's CORS policy; Open PDF remains available.

Manual acceptance: [Resume testing](testing/RESUME_TESTING.md).
