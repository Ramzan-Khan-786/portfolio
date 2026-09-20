# Admin CMS manual acceptance

Not executed. Use a staging database/provider folder and [setup guide](MANUAL_TESTING_GUIDE.md).

## Authentication and authorization

- [ ] Existing admin signs in with unchanged credentials.
- [ ] Normal user can use account screens but cannot enter CMS, upload media, import Drive PDFs, publish resumes or change global themes.
- [ ] Logged-out requests cannot read private media metadata/version files or mutate content.
- [ ] Invalid origin/missing mutation header is rejected; valid configured frontend can save.
- [ ] Logout revokes the session. Reopen a private PDF endpoint after logout; it must no longer be accessible.
- [ ] Existing email login, signup, password change and Google login/password-link flow remain separate from Drive import.

## Existing content editors

- [ ] Hero: name/greeting/headline/introduction, actions, managed media/position/visibility.
- [ ] Identity: name/profile photo/biography/location/availability/focus and default actions.
- [ ] Profile: education/highlights/interests/achievements and timeline ordering.
- [ ] About: narrative, managed image, principles and experience.
- [ ] Skills: add/edit/delete, category/icon/order/featured/visible.
- [ ] Projects: draft/publish/archive, URLs/description/technologies, managed thumbnail/cover/gallery/captions/order.
- [ ] Showroom: real project association, integration URL, source/tech/fallback, icon/preview/screenshot, default and visibility.
- [ ] Contact, navigation, pages, socials, footer and site settings save and retain their existing behavior.
- [ ] Validation errors preserve entered text and selected media. Failed uploads do not clear current published references.
- [ ] After save, public context refreshes; unrelated visitors obtain content on their next load (no realtime push is claimed).

## New management modules

- [ ] Media Library: grid, search/filter/sort/page, details, metadata, reuse, replacement and guarded deletion. Follow the full Cloudinary guide.
- [ ] Resume Management: draft/preview/publish/archive/rollback/delete and shared viewer. Follow the full Resume guide.
- [ ] Themes: policy/pool/preview/default restoration/personal override. Follow the full Theme guide.
- [ ] Dashboard counts match actual projects/users/media/resume versions, current publication and saved theme mode. Quick actions open working screens.
- [ ] Operations exposes configuration booleans and safe events, never actual secrets.

## Editor usability and failures

- [ ] Tab through labeled controls and native media dialog; Escape closes the picker and focus remains usable.
- [ ] Save/close/cancel resource edits; dirty close requires confirmation.
- [ ] Ordinary route-link navigation and page unload warn on unsaved content/theme/page-setting changes. Browser history/popstate is not a guaranteed blocker; save before using Back.
- [ ] Upload then navigate away without saving. Expected: staged library object remains; published content unchanged.
- [ ] Open two admin tabs and attempt overlapping writes. Expected: one may receive a retryable 409, not overlapping destructive media operations.
- [ ] Stop a staging API process during a write, restart and wait for lease expiry if needed. Expected: retry possible; review provider/library for partially completed upload.
- [ ] Resize sidebar/forms/library/viewer at 320, 390, 768, 1024 and 1536 pixels yourself. Check focus, overflow and mobile drawer.

## Logging and persistence

- [ ] After your own staging actions, review upload/delete/publish/archive/theme events and existing category logs.
- [ ] Confirm logs contain event IDs, permitted IDs/status/version/mode only—not uploaded bytes, JWTs, cookies, passwords, Drive tokens or Cloudinary secrets.
- [ ] Restart API/frontend yourself. Saved content, Cloudinary media and publication policy remain.
- [ ] Back up/restore staging MongoDB and provider assets using your operator process.

Result:

- [ ] Pass
- [ ] Fail
- [ ] Needs investigation
