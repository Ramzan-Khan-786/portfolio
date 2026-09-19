# CMS operating guide

Sign in at /admin with your seeded administrator. Normal user accounts cannot edit content. Existing administrator credentials survive reseeding. Save feedback appears only after a successful API response; invalid forms keep their edits and show validation errors.

## Modules

| Screen          | Controls                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Dashboard       | Actual content/user counts, resume status, section update time, recent projects                                        |
| Hero            | Home intro, image override, headline/greeting, ordered CTA entries, visibility                                         |
| Identity        | Shared developer name, initials/image, biography, availability, focus, default actions                                 |
| Profile details | Introduction, current focus, education, highlights/interests/achievements                                              |
| About           | Narrative, principles and structured experience                                                                        |
| Skills          | Flexible categories, icon URL, description/order/visibility                                                            |
| Projects        | Full CRUD, descriptions/images/tech/links/status/year, publication/feature/archive/order                               |
| Showroom        | Associated project, compact-selector label, embed/live/GitHub links, technologies, fallback copy, default/status/order |
| Resume          | Metadata, visibility, download action, PDF upload/removal and related links                                            |
| Contact         | Email/copy/action, email/social visibility, note                                                                       |
| Social links    | Shared platform URLs and enablement/order                                                                              |
| Navigation      | Labels/routes/order, desktop/mobile visibility; does not redefine system routes                                        |
| Footer          | Copyright and social visibility, useful links                                                                          |
| Themes          | Five allowed palettes, default and system preference policy                                                            |
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

Upload a trusted, unencrypted PDF of 1–50 pages, at most 5 MB, without scripts/forms/attachments. Upload updates the last-updated date; title, description, visibility, links and download availability are saved separately.

An uploaded PDF takes priority over externalUrl; legacy Identity resumeUrl remains a fallback when neither is configured. Removing a current PDF detaches it from publication; its bytes and previous versions remain private for operator recovery. If an external URL exists, it becomes active after detachment.

The public page reuses Profile education/achievements, About experience, Skills and Projects. Optional preview has an external-document fallback. A viewable PDF can be saved even when the download action is hidden; this setting is not access control.

## Themes and settings

Visitor theme preference persists and overrides the first-visit default while enabled. At least one theme and the default must remain enabled. Fieldwork uses the stored key terminal.

Recognized public settings: siteName, siteDescription, siteUrl, contactEmail, and legacy footerLine. Footer content is now controlled by its dedicated module. defaultShowroomId is internal and cannot be edited through generic Settings.

Images remain HTTPS URL fields. Google credentials and storage paths are environment configuration, never CMS content.
