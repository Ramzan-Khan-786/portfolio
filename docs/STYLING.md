# Styling ownership

The portfolio uses a hybrid architecture: Tailwind 3 utilities and daisyUI 4 theme tokens for common grid/flex layout, spacing, type, borders and responsive adjustments; colocated CSS for page composition, persistent layout, transitions, showroom geometry, forms and controls.

- shared/themes.js: one curated ten-theme catalogue for build, browser and API.
- tailwind.config.js: daisyUI 4 plugin using that catalogue.
- styles/themes.css: OKLCH daisyUI palette variables mapped to existing semantic tokens (no duplicate custom palettes).
- styles/base.css: reset, typography foundation, focus/selection and reduced motion.
- pages/PublicLayout.css: persistent viewport shell and route entry motion.
- pages/PortfolioHome.css, ProfilePage.css, ResumePage.css, AuthPage.css: distinct page compositions.
- components/*: header/footer, skill ledger, work catalogue, about/contact and full-height showroom.
- features/admin/Forms.css and ResourceManager.css: token-based structured editors/lists.
- features/media/Media.css: uploader, picker dialog, media grid and details.
- features/admin/ThemeEditor.css: scoped real-theme previews.
- components/ResumeViewer.css: bounded PDF.js viewer/text layer and controls.
- pages/AdminApp.css: management shell, drawer and workspace layout.

Use semantic token colors rather than hardcoded light surfaces. Existing stone/moss Tailwind aliases map to tokens for compatibility. CMS bitmap assets use reusable managed references with legacy URL compatibility; the identity fallback is initials, not a fake portrait.

Avoid universal rounded cards, gradient/glow decoration, and oversized headlines. Each route has its own composition but shares type, border and spacing conventions. Long content wraps; selectors and actual nested content may scroll locally without making the document wider. Keep global styles small and manually check all ten palettes when adding new controls.

The v1.3.0 styles have not been built or browser-verified; use the [manual theme checklist](testing/THEME_TESTING.md).

See [themes and motion](THEMES.md), [responsive verification](RESPONSIVE.md), and [frontend architecture](FRONTEND.md).
