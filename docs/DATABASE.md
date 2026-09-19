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
| Resume         | Unique primary key, editable metadata/links, hidden current UUID filename and byte size                                                 |
| AuthAttempt    | Unique hashed random proof, purpose/server-owned data, expiry with MongoDB TTL index                                                    |

Profile remains a logical singleton for compatibility. Resume and ContentSection enforce keyed uniqueness. AuthAttempt expiry is checked at request time, not just eventually by TTL cleanup, and accepted proofs are consumed atomically. Google tokens themselves are never stored.

## Visibility and relationships

Public projects require published and not archived; skills require visible; social/navigation/showroom entries require enabled. Section visibility controls page presentation. Shared section information may also be reused by Resume; do not treat section visibility as a secrecy mechanism.

A showroom entry may remain public independently of its project, but an unpublished project's private fields are never populated. defaultShowroomId is an internal Setting controlling the effective enabled default; fallback is first enabled in deterministic order. Legacy sandbox becomes iframe, never a local fake app.

## Non-destructive upgrade

Existing saved admins have role=admin and retain their hash/session version. New users default to user, and all signup paths explicitly set user. Seed creates only absent admins and refuses to elevate existing normal users.

Existing content receives compatible defaults; no real MongoDB mutation is performed by tests. Seed uses setOnInsert. The one targeted compatibility upgrade recognizes the exact unchanged legacy six-item navigation, moves Profile from / to /profile, adjusts the old default order and inserts Home/Resume. Customized records are preserved. Review customized navigation manually after upgrading. Seeding can recreate deleted defaults, so run deliberately after a backup.

Resume uploads are filesystem bytes plus MongoDB metadata: back up both together. Replaced/detached PDFs remain private and cannot be fetched by arbitrary filename. Prune old versions only with an explicit operator retention procedure, not broad directory deletion.

Unique email/googleId indexes must be created successfully before enabling public registration. Resolve any pre-existing duplicate data through an approved maintenance procedure, not silent automatic deletion. Slug changes do not create redirects.
