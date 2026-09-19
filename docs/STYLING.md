# Styling ownership

The portfolio uses a hybrid architecture: Tailwind utilities for common grid/flex layout, spacing, type, borders and responsive adjustments; colocated CSS for page composition, persistent layout, transitions, showroom geometry, forms and controls.

- styles/themes.css: five shared token palettes.
- styles/base.css: reset, typography foundation, focus/selection and reduced motion.
- pages/PublicLayout.css: persistent viewport shell and route entry motion.
- pages/PortfolioHome.css, ProfilePage.css, ResumePage.css, AuthPage.css: distinct page compositions.
- components/*: header/footer, skill ledger, work catalogue, about/contact and full-height showroom.
- features/admin/Forms.css and ResourceManager.css: token-based structured editors/lists.
- pages/AdminApp.css: management shell, drawer and workspace layout.

Use semantic token colors rather than hardcoded light surfaces. Existing stone/moss Tailwind aliases map to tokens for compatibility. Bitmap assets are optional CMS URLs; the identity fallback is initials, not a fake portrait.

Avoid universal rounded cards, gradient/glow decoration, and oversized headlines. Each route has its own composition but shares type, border and spacing conventions. Long content wraps; selectors and actual nested content may scroll locally without making the document wider. Keep global styles small and verify all five palettes when adding new controls.

See [themes and motion](THEMES.md), [responsive verification](RESPONSIVE.md), and [frontend architecture](FRONTEND.md).
