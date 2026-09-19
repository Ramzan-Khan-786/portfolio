# Themes and motion

Five CSS-token themes: Dark, Light, Midnight, Graphite, Fieldwork (stored key terminal). Each defines background/surface/elevated surface, primary/secondary/muted text, border, accent/hover/on-accent, soft accent, code background, danger colors and shadow.

Tokens live in src/styles/themes.css; base.css only holds reset, token import, typography/focus and reduced-motion foundations. Tailwind colors map to tokens so routine utilities participate in themes. Component CSS handles distinctive layout; the global stylesheet is not a page-style dump.

ThemeProvider reads CMS appearance preferences and localStorage portfolio-theme. The first visit follows system preference unless the CMS disables it and provides a default. A returning enabled visitor choice wins. The inline head script applies a saved valid palette before React initializes, reducing theme flash; server-owned restrictions are applied after bootstrap.

The native labeled selector is keyboard accessible. Dark/light/system changes do not introduce a separate theme dependency. CMS/account inputs, tables, drawers, notices and actions use the same tokens. Embedded third-party apps and browser PDF viewers control their own internal theme.

## Page transitions

Route content enters with a restrained 340 ms fade/translation between persistent navbar/footer rows. Ordinary scroll continues inside the route. A fresh boundary gesture can navigate to the next/previous enabled core page with momentum and transition locks. The footer provides explicit controls and a persistent opt-out.

prefers-reduced-motion suppresses animations and automatically disables wheel/touch route navigation. Showroom disables automatic route navigation even outside its iframe, so interacting with the application cannot move to another portfolio page. Project selection transitions are separately bounded to 340 ms and clean up their outgoing frame.
