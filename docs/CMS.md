# CMS operating guide

Sign in at /admin using the explicitly seeded account. Existing credentials survive reseeding; change your password under Account. No signup/reset-email flow is provided.

## Sections

- **Dashboard:** actual published project, enabled showroom/navigation, and visible skill counts plus recently edited projects.
- **Profile & About:** name, initials/image, introduction, biography, availability/location, focus areas, resume, and two link labels/destinations.
- **Skills:** category grouping, description, display order, visibility.
- **Projects:** full catalogue entries, safe external links, up to eight screenshot URLs, technologies, status/year, featured/published/archive controls.
- **Showroom:** independent presentation configuration, actual project dropdown, integration/full URLs, default, order, enabled/status.
- **Navigation:** labels, destination type, order, enablement, and separate desktop/mobile visibility.
- **Pages:** small plain-text pages such as Experience. Not a blog or HTML editor.
- **Social links:** one shared list for Contact and footer.
- **Site settings:** metadata/contact/footer text.
- **Account:** authenticated password change.

Saving displays success only after the API accepts the change. Failed saves keep edits and expose field errors. Delete requires confirmation and cannot be undone through the CMS; restore from your database backup if needed.

## Publishing workflow

1. Create the project as a draft and enter truthful descriptions and links.
2. Check the content, then enable Published. Archived / hidden overrides publication.
3. Optionally add a Showroom entry linked to that project. Its enabled/status flags are independent.
4. Open the public route to verify the result.

To hide an experience entirely, disable its showroom entry as well as unpublishing its project. If a deleted/unpublished project was associated, the entry still exists but its private project data will not appear publicly.

## Navigation and Experience

Use route destinations such as /work or /showroom. Anchor destinations such as #contact point to the homepage section from any route. External entries require a full HTTP(S) URL. Action entries are reserved; they must remain disabled.

For Experience, publish a Page with slug experience and add a route Navigation entry /experience. Creating a navigation label alone does not implement an arbitrary new screen. Renaming a page/project slug changes its URL without creating a redirect.

Order uses smaller integers first, with deterministic ID tie-breaking. This applies to projects, navigation, skills, socials, and showroom items. Disable items without deleting to retain content for later.

## Showroom and settings

Choose iframe for a real independently hosted app, or coming-soon for future work. Both Presentation and Availability must permit live display. A disabled item cannot be the default. If the selected default disappears, the first enabled item opens instead.

Recognized public settings:

| Key             | Meaning                               |
| --------------- | ------------------------------------- |
| siteName        | Document title base                   |
| siteDescription | Default page description              |
| siteUrl         | Public site origin for canonical URLs |
| footerLine      | Shared footer text                    |
| contactEmail    | Contact mailto destination            |

Other setting keys stay out of public bootstrap. Never use this collection for credentials. defaultShowroomId is internally managed.

Image/resume fields are URLs: upload assets to your own trusted hosting, then paste their HTTPS links. Missing/broken optional images do not block text content.
