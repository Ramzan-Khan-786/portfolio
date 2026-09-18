# Engineering Showroom

The showroom is an experience surface, not a second project catalogue. It lives at /showroom, with its CMS-ordered project selector directly beneath the public navigation.

## Connect the real TypeWriter

1. Deploy TypeWriter / Developers Keystroke independently with its intended public sandbox.
2. Confirm the public route works without privileged authentication.
3. Allow the portfolio origin in the TypeWriter host's CSP frame-ancestors policy. Remove conflicting X-Frame-Options DENY/SAMEORIGIN only as appropriate on that trusted embedded route.
4. In CMS → Showroom → TypeWriter, set Presentation=iframe and Availability=live.
5. Set Integration URL to that actual route and Full project URL to the independent full app. Select the associated project and enabled/default controls.
6. Test typing, scrolling, focus, external opening, reload, navigation, and mobile behavior on the actual deployed app.

The URL precedence is embedUrl → externalUrl → VITE_TYPEWRITER_URL for an item associated with project slug typewriter. The frontend fallback is public build configuration; CMS URLs are preferred. TYPEWRITER_URL on the backend only initializes absent seed records.

Until a real URL is supplied, the site shows an integration-in-preparation message. There is no fake local implementation or fabricated TypeWriter metric.

## Embedding contract

The iframe has an accessible title, full-width layout, bounded viewport-relative height, strict-origin-when-cross-origin referrer policy, and a sandbox allowing scripts, forms, popups, and the embedded origin. It cannot navigate the top window. Host the application on a separate origin and do not redirect it back into the portfolio.

For an explicit readiness indicator, the embedded app can send the following only after its usable UI initializes, with the real portfolio origin:

```js
window.parent.postMessage({ type: 'portfolio:ready' }, 'https://your-portfolio.example');
```

The parent checks both message source and origin. Without this optional message, the app remains fully interactive but the toolbar says Independent application rather than Connected.

Browser security prevents reliable introspection of cross-origin frames. In particular, iframe load may fire even when content is blocked, and error is not a reliable failure detector. The UI therefore provides loading/timeout feedback, Reload, Having trouble?, and Open full project, but does not falsely certify remote availability. See [MDN iframe behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#error_and_load_event_behavior).

A frame's own responsive UI is the independent application's responsibility. Portfolio CSS cannot repair a fixed-width page inside a cross-origin iframe. Test the real app at the target widths.

## Selection, motion, and lifecycle

Enabled records are sorted by order/ID. The effective default comes from the backend. Arrow keys/Home/End support tab selection and focus; mobile tabs scroll horizontally, and Previous/Next controls are available.

Moving right slides the current experience left and the next one in from the right; moving left reverses that direction. The outgoing panel is inert/hidden from accessibility APIs and removed after 480ms. Rapid switches cancel previous cleanup timers; reduced-motion preferences bypass the outgoing animation. Only the selected and briefly outgoing iframe are mounted, not every project.

Switching away can reset the independent app's in-memory state. Persistent typing progress, if required, belongs inside TypeWriter. No portfolio-level authentication or app-state bridge is assumed.

## Coming Soon and compatibility

Either status=coming-soon or presentationType=coming-soon renders the complete upcoming-project state. It has no disabled fake app controls. Missing, disabled, and empty selections have intentional fallback states.

Legacy sandbox presentation values are normalized to iframe for compatibility. They do not activate the removed local typing widget. The isolated browser test server includes a clearly labelled test fixture solely to prove iframe interaction; it is not TypeWriter and must never be used as production content.
