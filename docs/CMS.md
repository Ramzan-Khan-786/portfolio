# CMS operating guide

Sign in at /admin with your seeded administrator. Normal user accounts cannot edit content. Existing administrator credentials survive reseeding. Save feedback appears only after a successful API response; invalid forms keep their edits and show validation errors.

## Modules

| Screen          | Controls                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Dashboard       | Actual content/user/media counts, resume version, theme mode, section update time, recent projects                                        |
| Hero            | Home intro, managed image/position/visibility, name/headline/greeting, ordered CTA entries, visibility                                         |
| Identity        | Shared developer name, initials/managed profile photo, biography, availability, focus, default actions                                 |
| Profile details | Introduction, current focus, education, highlights/interests/achievements                                              |
| About           | Narrative, managed image, principles and structured experience                                                                        |
| Skills          | Flexible categories, managed icon/library/upload, description/order/featured/visibility                                                            |
| Projects        | Full CRUD, thumbnail/cover/reorderable gallery, descriptions/tech/links/status/year, publication/feature/archive/order                               |
| Showroom        | Preview/icon/fallback media, associated project, compact-selector label, embed/live/GitHub links, technologies, fallback copy, default/status/order |
| Resume          | Private PDF drafts, PDF.js preview, publish/archive/restore/delete, Drive/library import and page settings                                            |
| Media Library | Browse/drop upload, image/private PDF preview, search/filter/sort, metadata, usage and safe deletion |
| Contact         | Email/copy/action, email/social visibility, note                                                                       |
| Social links    | Shared platform URLs and enablement/order                                                                              |
| Navigation      | Labels/routes/order, desktop/mobile visibility; does not redefine system routes                                        |
| Footer          | Copyright and social visibility, useful links                                                                          |
| Themes          | Ten daisyUI palettes; universal/random-reload/random-daily policy, enabled pool and visitor overrides                                                            |
| Pages           | Published plain-text custom routes                                                                                     |
| Site settings   | Metadata/contact defaults; never secrets                                                                               |
| Users           | Paginated accounts; suspend/restore normal users without changing admin roles                                          |
| Account         | Change current administrator password                                                                                  |
| Operations      | Current database/configuration/uptime and redacted process events                                                      |

Structured repeaters provide add/remove and up/down controls. Education/experience entries have separate title, organization, period and description fields. Multiline lists use one entry per line. Do not fabricate achievements or experience to fill empty sections.

## Publishing and navigation

Create projects as drafts, review, then publish. Archived overrides publication. Showroom enablement is independent of project publication; an unpublished association's details are not exposed publicly. Disable the showroom entry too when hiding an experience.

The primary route order is Home → Profile → Skills → Work → Showroom → Resume → About → Contact. Enabled CMS routes determine footer/scroll sequence. Known old anchors map to their separate routes. Custom pages must be published before linking; external destinations use full HTTP(S) URLs. Future action navigation stays disabled. Changing a slug changes its URL without automatic redirects; update related navigation.

Ordering uses smaller integers first. Deletion asks for confirmation and has no CMS undo; recover deleted database records from backup.

## Resume

Upload a trusted, unencrypted PDF of 1–50 pages, at most 5 MB, without scripts/forms/attachments. It becomes a private Cloudinary **draft**, never immediately public. Preview it using the shared PDF.js viewer, then publish explicitly. A failed preview acknowledgement offers a retry. Publishing switches the single current version; earlier published versions appear archived. Restore/publish an archived version for rollback. Exact duplicate bytes are rejected; reuse the existing version instead.

The current published version takes priority over externalUrl and legacy Identity resumeUrl. Archiving it removes the current pointer but does not delete bytes; any configured external fallback can become visible. Clear those links too when intentionally removing all resume access. Active versions cannot be permanently deleted. Confirmed deletion of inactive versions removes the Cloudinary asset and metadata; recover through your backup process, not a CMS undo.

The public page reuses Profile education/achievements, About experience, Skills and Projects. The PDF.js preview provides real pages, selectable text, safe links, search, zoom, fit width, page controls and fullscreen. Open-original links remain available when an external PDF cannot be fetched due to CORS. A viewable PDF can be saved even when the download action is hidden; this setting is not access control.

## Themes and settings

Theme Management controls the universal fallback, enabled pool, policy mode and whether visitors may override it. Random on every reload picks once per tab load; a permitted manual choice lasts only until the next reload. Random-daily follows a UTC calendar day consistently across devices. The sidebar selector changes only this visit; the management page has search, light/dark filters, pool presets and an isolated preview. Save explicitly applies the global policy. Legacy Midnight/Graphite/Fieldwork preferences map to Night/Business/Coffee. See [theme-system.md](theme-system.md).

Recognized public settings: siteName, siteDescription, siteUrl, contactEmail, and legacy footerLine. Footer content is now controlled by its dedicated module. defaultShowroomId is internal and cannot be edited through generic Settings.

## Reusable media workflow

Browse or drop an image into a media field, or choose an existing image from the library. Set useful alt text/caption, then save the owning content form. Upload creates an asset but does not save the content reference. Replacing/removing a selection does not delete the old file. Unsaved changes trigger a warning for ordinary in-app links and browser unload; browser history interception is not guaranteed.

Project gallery controls support drag handles and keyboard-friendly up/down ordering. Optional icon background removal creates a separate asset and depends on Cloudinary account configuration; otherwise use a transparent PNG/WebP. Library deletion shows actual usages and rejects referenced assets, including resume version documents. Another admin mutation can return a retryable 409 while an upload/save is in progress.

Existing image URLs stay as fallbacks; no bulk migration or database rewrite is performed. New uploads use Cloudinary, never permanent local files. Google/Cloudinary secrets are environment configuration, never CMS content. See [media management](cloudinary-media-management.md) and [resume management](resume-management.md).

This update is implementation-only. Complete the [CMS manual checklist](testing/ADMIN_CMS_TESTING.md) before publishing real content.
