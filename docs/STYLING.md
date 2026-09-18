# Styling architecture

The design uses warm neutral surfaces, dark green emphasis, restrained borders, readable system typography, and generous but responsive spacing. No external font request is required.

## Ownership

| Location                               | Owns                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| src/styles/base.css                    | Tailwind layers, color tokens, typography/reset, focus, selection, reduced motion |
| src/pages/PublicLayout.css             | Shared public shell, section spacing/headings, layout helpers                     |
| src/components/*.css                   | Named public component layout and interactions                                    |
| src/pages/DetailPage.css               | Project/text page reading layout                                                  |
| src/pages/AdminApp.css                 | CMS frame, sidebar/drawer, toolbar, notifications                                 |
| src/features/admin/Forms.css           | Shared admin form controls                                                        |
| src/features/admin/ResourceManager.css | Resource tables, mobile records, editor actions                                   |
| tailwind.config.js                     | Reusable utility palette/font extensions                                          |

Import a component's stylesheet from its component. Keep shared layout in the layout owner, not in the reset stylesheet. Routine grid/flex/gap/padding/typography uses Tailwind. Complex showroom transitions, responsive menu states, and reusable visual components use scoped external CSS.

base.css provides ink, muted, paper, line, and accent tokens; utilities and component styles share this palette. Existing component-specific rules are intentionally separate from global CSS. New variants should reuse these tokens rather than invent another almost-identical color/spacing system.

## Interaction constraints

Buttons/links that act as controls have usable touch targets, visible keyboard focus, and disabled states. Long URLs and text wrap instead of forcing document overflow. Horizontal scrolling is intentional only inside selectors/navigation where appropriate.

Showroom transition rules live exclusively in Showroom.css. Reduced-motion defaults live globally and are also respected by the selection logic. Do not animate large page sections on every render or hide essential content behind entrance animations.

Use npm run format:check and npm run lint after changes; run browser QA at 320/390/768/1536 at minimum, plus all eight automated viewport widths before release.
