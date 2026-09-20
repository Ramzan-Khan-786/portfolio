# Database and upgrades

MongoDB models use Mongoose timestamps. Unique indexes enforce account and slug/key identity.

| Model          | Purpose                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| User           | Unique normalized email, hidden passwordHash, user/admin role, sessionVersion, disabled, optional sparse-unique googleId, emailVerified |
| Profile        | Shared identity/biography/focus/default CTAs and legacy resume URL                                                                      |
| ContentSection | Unique allowed section key and server-validated structured data                                                                         |
| Skill          | Category, description/icon URL, order/visibility                                                                                        |
| Project        | Unique slug, descriptions/images/technologies/links/status/year and publication controls                                                |
| ShowroomItem   | Independent presentation, optional Project relation, URLs/tech/fallback/default/order                                                   |
| NavigationItem | Label/destination/type, order/enabled and viewport visibility                                                                           |
| SocialLink     | Platform label/kind/URL/order/enabled                                                                                                   |
| Setting        | Unique key/value; public keys explicitly allowlisted                                                                                    |
| Page           | Unique nonreserved slug and published plain-text content                                                                                |
| Resume | Unique primary key, editable page metadata/links, currentVersion pointer; hidden legacy filename/size for read-only delivery |
| ResumeVersion | Unique version number, media reference, unique SHA256, title/description, source, page/byte counts, preview/publication/archive timestamps |
| MediaAsset | Provider IDs/type/folder, image/document metadata, private secureUrl, checksum, uploader and ready/deleting/delete-failed state |
| ThemeSettings | Keyed global policy, curated enabled pool, universal fallback, override flag and revision |
| ResumeCounter | Atomic monotonic version allocation; failed uploads can leave harmless numbering gaps |
| CmsMutationLease | Short-lived MongoDB lease serializing CMS writes; owner, expiry and heartbeat |
| AuthAttempt    | Unique hashed random proof, purpose/server-owned data, expiry with MongoDB TTL index                                                    |

Profile remains a logical singleton for compatibility. Resume and ContentSection enforce keyed uniqueness. AuthAttempt expiry is checked at request time, not just eventually by TTL cleanup, and accepted proofs are consumed atomically. Google tokens themselves are never stored.

## Visibility and relationships

Public projects require published and not archived; skills require visible; social/navigation/showroom entries require enabled. Section visibility controls page presentation. Shared section information may also be reused by Resume; do not treat section visibility as a secrecy mechanism.

A showroom entry may remain public independently of its project, but an unpublished project's private fields are never populated. defaultShowroomId is an internal Setting controlling the effective enabled default; fallback is first enabled in deterministic order. Legacy sandbox becomes iframe, never a local fake app.

## Non-destructive upgrade

Existing saved admins have role=admin and retain their hash/session version. New users default to user, and all signup paths explicitly set user. Seed creates only absent admins and refuses to elevate existing normal users.

Existing content receives compatible defaults; no real MongoDB mutation was performed for this implementation. Seed uses setOnInsert. The one targeted compatibility upgrade recognizes the exact unchanged legacy six-item navigation, moves Profile from / to /profile, adjusts the old default order and inserts Home/Resume. Customized records are preserved. Review customized navigation manually after upgrading. Seeding can recreate deleted defaults, so run deliberately after a backup.

New uploads are Cloudinary assets plus MongoDB metadata/references: back up both together. Profile/Skill/Project/Showroom/section images store managed media references while legacy URL fields remain compatible. Public responses hydrate only the referenced ready images; private Cloudinary delivery data is not exposed.

Resume publication uses one authoritative currentVersion pointer; status is derived against it. Drafts/archived versions remain private. Generic media deletion refuses references from any resume version. CMS mutations acquire a database lease before provider work/content writes; conflicts return 409 rather than running reference deletion concurrently with a save. Provider and MongoDB writes are not an atomic transaction; compensation and retryable delete-failed records support recovery.

Existing local resume files remain readable only through the established current legacy metadata until deliberately re-uploaded, previewed and published. No automatic migration, real DB write or deletion ran during this task. Keep legacy files/backups until manually verifying the replacement. ThemeSettings is created on first policy save; until then the old appearance document supplies a compatible fallback.

Unique email/googleId indexes must be created successfully before enabling public registration. Resolve any pre-existing duplicate data through an approved maintenance procedure, not silent automatic deletion. Slug changes do not create redirects.
