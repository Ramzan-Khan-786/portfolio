# Themes and motion

The canonical [theme system guide](theme-system.md) describes the shared ten-theme daisyUI catalogue, backend policy, per-reload/daily assignment, visit-only visitor overrides, storage fallback and migration. Admin → Themes previews and saves the actual palettes.

Tailwind 3 and daisyUI 4 remain compatible with the existing React/Vite architecture. Existing semantic CSS tokens map to daisyUI's OKLCH variables; page/component CSS keeps responsibility for layout. Public, account and admin surfaces share the selected palette. Third-party iframe content and the PDF document itself keep their own appearance.

## Page transitions

Route content enters with a restrained 420ms fade/10px translation between persistent navbar/footer rows. Long content scrolls normally inside the route. At the true boundary, 36px of accumulated wheel movement or a 48px vertical swipe can navigate to the adjacent enabled core page. Slow deliberate wheel input counts; rapid scrolling is not required. Transition and momentum-tail guards prevent an input burst from skipping pages.

Showroom remains a fixed-height, non-scrollable experience. Scroll on its heading, caption or surrounding chrome to navigate to the previous/next portfolio page. Events inside a cross-origin iframe belong to the embedded app and cannot be captured by the parent. No gesture-blocking overlay is placed over the application. Project selection transitions remain independently bounded to 340ms.

The footer provides explicit navigation and a persistent scroll-navigation opt-out. prefers-reduced-motion suppresses animation and disables wheel/touch route changes. Nested scrollers, forms, PDF controls, horizontal gestures and modifier zoom are protected.

v1.3.0 implementation is not runtime-verified. Use the [theme checklist](testing/THEME_TESTING.md) and [regression checklist](testing/REGRESSION_CHECKLIST.md).
