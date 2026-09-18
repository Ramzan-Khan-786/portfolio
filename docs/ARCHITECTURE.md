# Architecture

## Boundaries

```text
Browser (React public site / administrator workspace)
  → /api via same-origin proxy or explicitly allowed API origin
  → Express: headers → JSON → mutation checks → route authorization → validation
  → controllers / showroom and seed services
  → Mongoose → MongoDB

Showroom selection → independent app in a constrained cross-origin iframe
```

MongoDB is the content source of truth. The frontend owns interaction/layout, not a duplicated catalogue. Work is the published project catalogue; Showroom is an independently ordered list of interactive or upcoming experiences. A project may exist without a showroom entry.

## Repository

- `portfolio_frontend/src/components`: public sections and reusable UI.
- `portfolio_frontend/src/pages`: layouts, route-level screens, CMS shell.
- `portfolio_frontend/src/features/admin`: resource definitions, forms, dashboard, authentication UI.
- `portfolio_frontend/src/context`: shared public bootstrap with loading/error/refresh.
- `portfolio_frontend/src/lib`: API and safe content helpers.
- `portfolio_backend/src/routes`: public, authentication, admin namespaces.
- `portfolio_backend/src/controllers`: HTTP use cases.
- `portfolio_backend/src/models`: persisted schemas and indexes.
- `portfolio_backend/src/services`: showroom defaults/relations and non-overwriting seed.
- `portfolio_backend/src/middleware`: authorization, origin checks, validation, errors.
- `tests/e2e`: browser → API → isolated MongoDB → public UI scenarios.

## Decisions and tradeoffs

React Router provides real route views and client-side 404s. Single-segment custom routes resolve published simple text pages. The SPA host must rewrite non-API/non-asset paths to index.html; the host may return HTTP 200 for a client-rendered 404. There is no SSR or universal server-rendered social-preview metadata.

Public bootstrap contains only public content and lightweight project summaries. Full descriptions/screenshots load on detail routes. Admin and Showroom chunks are lazy-loaded. Mutations refresh public content in the current tab; other visitors receive updates on the next fetch/page load, not through realtime push.

CSS is colocated with its owner; Tailwind handles routine layout. The global stylesheet contains tokens, reset, focus, and motion defaults. Backend and frontend can be deployed independently, but a same-origin proxy simplifies cookies.

V1 has one administrative role, no registration, public messaging, uploads, rich-text HTML, AI, blog, or analytics pipeline. Image/resume links point to externally hosted assets. Additional functionality needs an actual implementation, not just a navigation record.
