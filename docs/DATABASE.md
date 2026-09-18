# Database

MongoDB is accessed through Mongoose; all models have creation/update timestamps.

| Model          | Content and constraints                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User           | Unique lowercase email, hidden bcrypt password hash, admin role, sessionVersion                                                                          |
| Profile        | Logical singleton: identity, headline, introduction, biography, focus areas, images/resume, two configurable CTAs                                        |
| Skill          | Name, category, description, order, visible                                                                                                              |
| Project        | Unique slug, title, summary/full text, category, images/screenshots, technologies, external links, status/year, publication/archive/feature flags, order |
| ShowroomItem   | Label, nullable Project reference, description, presentation/status, embed/full URLs, enabled/order, legacy default flag                                 |
| NavigationItem | Label, destination type/URL, order/enabled, desktop/mobile visibility                                                                                    |
| SocialLink     | Label, platform kind, safe URL, order/enabled                                                                                                            |
| Setting        | Unique key and value; API accepts bounded text                                                                                                           |
| Page           | Unique slug, title, summary, plain-text body, published/order                                                                                            |

Project has an index on published/archived/order; showroom has enabled/order. Unique email, project/page slug, and setting key enforce identity constraints. Profile is maintained as one record by the application; there is no database-enforced singleton key.

## Visibility and relationships

Only published, nonarchived projects are public. The status label is editorial metadata; the separate Archived / hidden toggle controls visibility. Skills require visible, social/navigation/showroom records require enabled. A showroom item is independently public even when its project is unpublished, but that project's private fields are not populated. Disable the showroom entry too if the whole experience should be hidden.

defaultShowroomId is an internal setting pointing to the selected enabled item. It is excluded from the general Settings UI and public bootstrap. If unavailable, the first enabled item in order is selected; older isDefault flags are honored only before an authoritative setting exists. Responses normalize isDefault to exactly one effective enabled default.

Order is ascending numeric order, then ID for deterministic ties. Unique slugs are generated from project titles if omitted. Slug edits change URLs; V1 has no automatic old-slug redirect history.

## Seed and upgrades

The seed uses setOnInsert. Existing CMS values and user passwords are preserved. Rerunning can restore deleted initial records, so it is not a recurring content sync job. New records include a starter profile, skills, one TypeWriter project, two showroom entries, routes, and basic settings. Social links/contact address are not invented.

Legacy sandbox showroom types are read as iframe. There is no local TypeWriter replacement. Old homepage anchors remain valid where a section exists; change the Showroom navigation destination to /showroom to reach the full experience. Reauthenticate after the token format/security upgrade.

Take a database backup before upgrades. No migration or live seed was executed by automated tests: test suites create and drop isolated temporary databases. Production backup schedules, access controls, and restoration drills remain deployment responsibilities.
