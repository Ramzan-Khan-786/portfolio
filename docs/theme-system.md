# daisyUI theme system — V1.3

Status: implemented, source-reviewed only. No tests, builds, lint, servers or browser automation were run for this update.

Tailwind 3/daisyUI 4 remain the palette foundation. shared/themes.js supplies the catalogue, labels, light/dark grouping, supported modes, defaults and normalization for both applications. The ten palettes remain Light, Dark, Corporate, Business, Night, Dim, Nord, Coffee, Winter and Sunset. Semantic CSS tokens map to actual daisyUI variables.

## Requested reload behavior

Choose **Admin → Themes → Random on every reload**, enable the desired palettes and visitor choice, then save.

1. A new browser tab or full reload chooses a random enabled palette.
2. That assignment stays stable through SPA navigation, React rerenders, focus changes and background policy refreshes.
3. A visitor may select a different enabled theme. That choice lives only in the current document/tab's memory.
4. The next full reload/new visit discards the manual choice and draws again. It does not restore a localStorage preference.
5. When sessionStorage is available and at least two themes are enabled, the new draw excludes the last displayed theme in that tab, including a manually selected one.

One enabled palette necessarily produces the same result; the editor warns about this. Blocked storage does not break selection or cause rerolls during the visit, but subsequent reloads may repeat a theme. Separate tabs do not sync their manual choices.

## Global policy versus personal appearance

The CMS sidebar's **This visit's appearance** control changes only that tab. Its Reset/Return to automatic control clears the current manual choice, returning to the same visit's assigned palette, not drawing repeatedly.

The Theme Management page edits the global policy and never saves merely because a card is previewed. It includes:

- Explicit radio choices for Random on every reload, One default theme and Daily rotation.
- An enabled-pool count, search, light/dark/enabled filters and Enable all/Light only/Dark only presets.
- Compact palette swatches, individual enable controls and default/fallback selection.
- One scoped preview panel that never changes the actual workspace.
- Save, Discard, Restore defaults and unsaved-change feedback.
- A visitor override switch with explicit reload-lifetime copy.

Fixed mode starts each reload with the default palette. Daily mode uses a deterministic sorted-pool index based on the UTC calendar day. A manual choice wins for the rest of the current visit in either mode, unless the administrator disables overrides or removes that theme from the pool. Nothing is written to a visitor account.

## Storage and initialization

| Location | Purpose |
| --- | --- |
| localStorage: portfolio-theme-settings-v2 | Public policy cache only |
| sessionStorage: portfolio-theme-last-viewed-v3 | Last displayed palette, solely to exclude it from the next random draw |
| window.__portfolioThemeVisit | In-memory choice, stable random assignment and previous-palette hint for this document only |
| localStorage: portfolio-scroll-navigation | Separate route-gesture preference, unchanged |

The old portfolio-theme, portfolio-theme-device-v2 and portfolio-theme-resolved-v2 preferences are ignored. They are not used to restore visitor choices across reloads.

themeBootPlugin.js emits a blocking head initializer from the same shared policy/storage functions, before CSS and React. React reads that document's existing assignment instead of drawing again. A cached policy can therefore pick the new theme before paint, without showing the previous visit's manual choice first. A first-ever visit cannot know an uncached server policy: it starts from the code defaults and reconciles after bootstrap. Restrictive host CSP must allow the generated initializer with an appropriate hash/nonce.

The public policy refreshes on focus/visibility and once per minute while visible. This does not reroll random mode or discard a valid manual choice. A disabled current theme can force a safe replacement; no realtime server push is claimed.

## Compatibility and API

New configuration defaults to random-reload. Existing explicitly saved universal or random-daily policies are preserved; use the editor to switch them. Old random-device records and API requests normalize to random-reload without a live database migration. Legacy fixed appearance records remain fixed until deliberately changed. No real settings or database records were modified during implementation.

ThemeSettings stores mode, universalTheme, enabledThemes, allowVisitorOverride, revision and updater/timestamps. The supported current modes are universal, random-reload and random-daily. Saving revises the policy but does not itself reroll an already-valid per-visit assignment.

GET/PUT /api/admin/themes is admin-only. GET /api/public/themes, GET /api/theme/settings and bootstrap return the public policy. The API rejects an empty pool and a fallback not included in the pool.

## Page navigation

The existing gentle boundary gestures, 420ms route motion, reduced-motion behavior and footer opt-out are unchanged. Showroom stays viewport-bounded and non-scrollable; outer-chrome gestures navigate while embedded-app input stays isolated.

Manual acceptance: [Theme testing](testing/THEME_TESTING.md), [regression checklist](testing/REGRESSION_CHECKLIST.md).
