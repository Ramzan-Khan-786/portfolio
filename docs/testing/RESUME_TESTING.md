# Resume manual acceptance

Not run. Read [setup](MANUAL_TESTING_GUIDE.md) and [resume architecture](../resume-management.md). Use non-sensitive staging documents. Record expected/actual evidence for every case.

## Upload and validation

- [ ] Browse a valid text PDF; upload. Expected: processing feedback, private Cloudinary object, numbered draft, no public publication.
- [ ] Drag/drop a second PDF. Expected: same validation/version pipeline.
- [ ] Upload an identical PDF copy. Expected: duplicate message naming the original version; no extra version/object.
- [ ] Try empty, fake, corrupt, encrypted, >5 MB or >50-page documents. Expected: rejection without a new version.
- [ ] Open a tagged PDF containing ordinary text and HTTP links. Expected: structure tags are not mistaken for dangerous actions.
- [ ] Cancel/interrupt upload; inspect version list before retrying. Expected: clear uncertainty if the server may have completed.
- [ ] Select a private PDF from Media Library. Expected: separately owned resume version with the same duplicate guard.

## Preview and publication lifecycle

1. [ ] Upload v1 (actual version number may differ due to existing data/counter gaps).
2. [ ] Before preview, confirm Publish is unavailable.
3. [ ] Open preview; wait for an actual page render. Review every page. If acknowledgement failed during another CMS change, use the retry acknowledgement button after the viewer is ready.
4. [ ] Edit version title/description; save.
5. [ ] Publish v1 with confirmation. Expected: one published pointer; public /resume displays v1 without rebuilding.
6. [ ] Upload and preview a different v2. Expected: v1 remains public while v2 is draft.
7. [ ] Publish v2. Expected: v2 published, v1 archived, public file content changes.
8. [ ] Choose Restore / publish on v1. Expected: v1 becomes public again, v2 archived, no upload.
9. [ ] Archive the active version. Expected: current managed file unavailable; any configured legacy external fallback may still appear. Clear fallback URLs if no public PDF should remain.
10. [ ] Attempt active-version permanent deletion before archiving. Expected: UI/API reject it.
11. [ ] Delete a disposable archived version after confirmation. Expected: Cloudinary PDF and version/media metadata removed; other versions unaffected.
12. [ ] In a safe staging fault scenario, provider deletion fails. Expected: retained/retryable metadata, not a false success.

## Google Drive import

- [ ] With configuration absent, confirm local upload fallback and disabled Drive control.
- [ ] Configure authorized origins, consent/test users, numeric app ID, restricted key and Drive/Picker APIs.
- [ ] Choose Import from Google Drive. Expected: explicit Google consent for drive.file and PDF picker.
- [ ] Select a real PDF under 5 MB. Expected: common validation, new private Cloudinary draft, source=google-drive.
- [ ] Cancel/deny consent, block popup, let token expire or select an inaccessible file. Expected: actionable error; existing resume unchanged.
- [ ] Try a duplicate PDF from Drive. Expected: existing-version message.
- [ ] Inspect application storage/logs yourself without copying tokens. Expected: no persisted Google access/refresh token; no Drive sharing URL used as public resume.

## Shared public/admin PDF viewer

- [ ] Select and copy text from the PDF; do not mistake rendered bitmap pages for the source.
- [ ] Search a known term, advance/back through matches; search a nonexistent term.
- [ ] Use previous/next page and numeric navigation; check first/last boundaries.
- [ ] Zoom in/out, fit width, resize viewport, enter/exit fullscreen where supported.
- [ ] Click a safe HTTP(S)/mailto link; expected new context/no script execution. Follow an internal page link if present.
- [ ] Download and Open PDF; compare content to the chosen version.
- [ ] Disable download action; expected toolbar/page button hidden and public download endpoint denied. Viewing remains saveable, not DRM.
- [ ] Hide Resume; expected public metadata does not expose draft/current details and file access is unavailable.
- [ ] Try a scanned PDF; expected page rendering, but no invented OCR/search matches.
- [ ] Exercise loading and unavailable-document errors. Retry/Open PDF remain clear.
- [ ] Test narrow portrait, short landscape, touch scrolling, keyboard focus and your target browsers.
- [ ] Scroll inside the PDF; expected no portfolio page navigation.
- [ ] Inspect local PDF worker, CMap/font/WASM/decoder fallback loading yourself; expected actual assets, not HTML fallbacks.
- [ ] Restart API yourself; published Cloudinary file remains available.
- [ ] If migrating a legacy local file, upload/preview/publish the original, then check that it no longer depends on local storage. No automatic old-file deletion should occur.

Result:

- [ ] Pass
- [ ] Fail
- [ ] Needs investigation
