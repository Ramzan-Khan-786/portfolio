# Portfolio V1.3 manual regression checklist

Not executed. Do not interpret old V1.2 test reports/screenshots as acceptance of this change.

## Public routes and layout

- [ ] Home: identity, actions, optional managed portrait, selected work and honest counts.
- [ ] Profile: managed image and structured background.
- [ ] Skills: grouped content, legacy and managed icons.
- [ ] Work: filtering, managed thumbnail, project detail/cover/gallery and links.
- [ ] Showroom: real independent app, compact layout, tabs/keyboard selection, live/source links, Coming Soon/unavailable states.
- [ ] Resume: published metadata/PDF.js/shared background and privacy/download rules.
- [ ] About: narrative/managed image/experience.
- [ ] Contact: email/socials/actions.
- [ ] Navbar/footer remain visible; mobile menu and explicit page arrows work.
- [ ] Custom published page, deep-link refresh and not-found behavior.
- [ ] Empty/offline/retry states do not fabricate data.

## Gentle page scrolling — requested behavior

- [ ] With automatic page navigation on, scroll ordinary page content normally. It must not skip unread content.
- [ ] At the bottom, one ordinary mouse notch advances; slow small trackpad deltas also accumulate without a fast-flick requirement.
- [ ] At the top, a gentle upward gesture returns to the previous enabled route.
- [ ] Long trackpad momentum does not skip several pages during one transition.
- [ ] Reverse direction deliberately after a transition; it becomes responsive when momentum/transition lock settles.
- [ ] Swipe vertically about 48 px from a true boundary on touch hardware. Horizontal gestures must not navigate.
- [ ] Scroll over Showroom heading, tabs, caption and other surrounding portfolio area: down → next page, up → previous page.
- [ ] Showroom remains bounded to the middle viewport; no large added content or vertical page scrollbar. Coming-soon/unavailable panels also stay non-scrollable with compact/clamped copy.
- [ ] Scroll/type/click inside the live iframe: the embedded app keeps those gestures; they do not bubble to the portfolio.
- [ ] Focus the iframe, then move the pointer back to the Showroom caption and scroll. Parent navigation should work without an extra defocus click.
- [ ] PDF viewer, text inputs, dropdowns and nested scrolling stay isolated.
- [ ] Ctrl/meta zoom, Shift/horizontal scrolling do not trigger page changes.
- [ ] Turn navigation off in footer; refresh and confirm persistence.
- [ ] Reduced-motion preference suppresses animation and automatic navigation; explicit links/arrows still work.
- [ ] Browser Back/Forward restores route/scroll positions.
- [ ] Check portrait and short landscape, especially 844 × 390, yourself.

## Auth and CMS

- [ ] Admin login/logout/password changes.
- [ ] Normal-user login/signup/account/admin denial.
- [ ] Google login, mandatory new portfolio password and password-confirmed linking.
- [ ] Existing CMS CRUD, navigation/default/visibility/order behavior.
- [ ] Media Library and Cloudinary upload/reuse/deletion.
- [ ] Resume lifecycle, duplicate detection, Drive import if configured.
- [ ] All theme modes, visitor override and enabled-pool changes.

## Deployment-specific acceptance

- [ ] HTTPS cookie topology and exact CORS origins.
- [ ] Cloudinary image/PDF delivery and optional background capability.
- [ ] CSP allows only required API/image/Google/frame/worker sources.
- [ ] Local PDF worker/fonts/CMaps/WASM/decoder fallback scripts are deployed and are not rewritten to HTML.
- [ ] No draft PDF accessible to unauthenticated users.
- [ ] New uploads survive backend restart without filesystem storage.
- [ ] Legacy local resume is migrated deliberately before retiring its disk.
- [ ] Browser/mobile accessibility, contrast and PDF behavior checked on actual target platforms.
- [ ] Logs/backups/provider asset restoration and cleanup procedure reviewed.

Overall result:

- [ ] Pass
- [ ] Fail
- [ ] Needs investigation
