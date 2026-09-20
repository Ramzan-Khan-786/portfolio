# Cloudinary manual acceptance

Not run. Use the [setup guide](MANUAL_TESTING_GUIDE.md). For each numbered case record: [ ] Pass · [ ] Fail · [ ] Needs investigation.

## Configuration, validation and upload feedback

1. [ ] In a staging environment with missing Cloudinary configuration, open Media Library and Resume. Expected: explicit unavailable configuration, no fabricated success.
2. [ ] Configure real staging credentials and restart the API yourself. Upload a small JPEG through Browse and a PNG through drop. Expected: Selected → Uploading byte progress → Processing → Uploaded, filename/size/preview, persisted library entry.
3. [ ] Select unsupported SVG/GIF, renamed HTML, empty or oversized input. Expected: frontend rejection where recognizable and independent backend rejection of spoofed content. No permanent object/metadata.
4. [ ] Try a >25-megapixel or animated image. Expected: readable rejection, no fake processed preview.
5. [ ] Cancel during transfer, then inspect the library. Expected: explicit cancellation notice; if server processing had begun, any completed asset can be found and managed.
6. [ ] Simulate a staging network/provider/credential failure yourself. Expected: actionable error and preserved current content. Restore credentials; do not paste provider secrets into reports.

## Hero

1. [ ] Open Hero → upload image → set alt text and position → save. Expected: Home uses that image without a frontend rebuild.
2. [ ] Reload both CMS and Home. Expected: selected media ID, alt text and placement persist.
3. [ ] Upload/select a replacement, then leave without saving. Expected: unsaved warning; old published image remains. New upload remains available in library.
4. [ ] Save the replacement. Expected: new image appears; old object is retained until explicitly deleted.
5. [ ] Remove selection and clear any legacy override URL; save. Expected: shared profile fallback applies. Toggle Show hero image off and save to hide the portrait entirely.
6. [ ] Re-enable image, change name/headline/introduction/CTA/visibility. Expected: existing Hero controls still work.

## Identity / Profile and About

1. [ ] Upload/select a profile image in Identity; set descriptive alt text; save. Expected: Profile and Home fallback use it.
2. [ ] Replace it, refresh and restart backend yourself. Expected: image persists via Cloudinary, not a new local uploads file.
3. [ ] Reuse the same image via library in About; set a different field-level caption. Expected: one stored asset can serve both references independently.
4. [ ] Attempt to permanently delete it while either reference remains. Expected: 409 with usage details and no broken live image.

## Skills

1. [ ] Upload transparent PNG/WebP and save a skill. Expected: icon retains transparency and uses optimized delivery.
2. [ ] Upload a nontransparent icon. Expected: it remains nontransparent unless explicitly processed; no fake background removal.
3. [ ] With removal disabled, inspect asset details. Expected: unavailable explanation and transparent-file fallback.
4. [ ] Only with a supported staging account enabled, request background removal and confirm possible charges. Expected: separate processed icon or an honest provider/pending error; original unchanged.
5. [ ] Select the processed/replacement asset in the skill editor, save, reorder, toggle featured/visible and delete the skill. Expected: actual content changes; deleting a skill does not silently delete shared media.

## Projects and Showroom

1. [ ] Upload distinct project thumbnail and cover, then several gallery images. Add alt text/captions. Save/publish and inspect catalogue/detail yourself.
2. [ ] Reorder gallery using arrows and drag handles; reload. Expected: stored array order persists.
3. [ ] Replace/remove one gallery entry, save, then inspect old asset usage before deletion.
4. [ ] Add Showroom icon, Coming Soon preview and unavailable screenshot. Expected: only supporting UI changes; a configured live app remains an actual iframe.
5. [ ] Inspect short landscape. Expected: images do not introduce vertical page scrolling; compact fallback images may be hidden.

## Library, metadata, deletion and recovery

1. [ ] Search by name, alt text and tags; change category/type/sort; paginate beyond 24 fixtures if available. Expected: consistent counts, bounded pages, empty/error states.
2. [ ] Open image/PDF details, inspect dimensions/size/source ID and usage. Expected: private PDF uses authenticated preview, not a public signed URL.
3. [ ] Edit display name, alt text, caption and tags; reload. Copy an image delivery URL. Expected: saved metadata and copy feedback.
4. [ ] Select existing media in a different editor. Expected: no re-upload; content still needs Save.
5. [ ] Delete an unused disposable asset after confirmation. Expected: both Cloudinary object and MongoDB metadata removed.
6. [ ] Attempt deletion of a used image or any resume-linked asset. Expected: blocked; resume versions must be managed through Resume.
7. [ ] In an isolated staging fault scenario, let Cloudinary deletion fail. Expected: delete-failed metadata retained and retry possible. Do not delete real assets to test recovery.
8. [ ] Simulate a metadata-write failure only in staging. Expected: upload cleanup attempted; cleanup failures yield a safe event/public ID for operator reconciliation. No claim of a cross-provider atomic transaction.
9. [ ] Restart backend and reload published media. Expected: new assets persist independently of backend disk.
10. [ ] Inspect sample delivery requests yourself. Expected: bounded c_limit width and f_auto/q_auto for managed images; no entire-library request on public routes.

Record final result:

- [ ] Pass
- [ ] Fail
- [ ] Needs investigation
