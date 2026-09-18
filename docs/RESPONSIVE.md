# Responsive design and QA

Target viewport widths: **320, 375, 390, 430, 768, 1024, 1280, 1536 CSS pixels**.

The public shell is fluid with a 1200px reading/layout limit. Headers switch to a compact menu; profile and section grids stack; typography uses bounded fluid sizes; project technologies and actions wrap. Showroom tabs deliberately scroll within their container rather than making the document wider. The embed fills its container with a usable minimum height.

The admin sidebar becomes a dismissible drawer on narrow screens. Forms use fewer columns, long values wrap, tables turn into labelled record cards, and buttons retain touch targets. Validation errors remain next to their fields.

## Automated coverage

The Playwright suite visits seven public views and ten admin views at every target width. It asserts that document scrollWidth does not exceed the viewport and that actual route content is visible. Admin checks wait for loaded dashboard/forms/lists, then open resource editors. The suite exercises mobile navigation, Escape/focus, iframe input, tab switching direction, and API errors.

Screenshots are written for representative 320/390/768/1536 layouts under artifacts/qa. Image captures wait for fonts and paint frames; showroom captures wait for its controlled test iframe. Assertions are not a substitute for visually reviewing these images.

## Manual release checklist

- Public header, all navigation links, contact/footer, detail pages, no broken images.
- Both switch directions, Coming Soon, empty showroom, unavailable/blocked embed, external project link.
- Public and CMS mobile menus: touch, keyboard, Escape, focus restoration.
- Admin login, editing, field errors, long values, delete confirmation, session expiration.
- Real TypeWriter responsiveness and input at all target widths.
- Reduced motion, keyboard-only use, zoom/text scaling, portrait/landscape.
- Chrome/Firefox/Safari and a physical mobile browser, including the onscreen keyboard.

Current automated coverage uses desktop Chromium viewport emulation. It does not certify physical-device Safari/Firefox behavior, arbitrary CMS content lengths, or a third-party application's responsive implementation. See [testing](TESTING.md) for evidence and limitations.
