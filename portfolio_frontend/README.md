# Portfolio frontend

React 18, React Router, Vite, Tailwind 3/daisyUI 4, PDF.js, Lucide icons, and component-specific CSS. Use Node 22.13+ or a supported newer LTS. This directory contains the public portfolio, account screens, and admin CMS.

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd test
npm.cmd run build
```

Run from this directory. The default development /api proxy targets localhost:5000. See [.env.example](.env.example); VITE variables are public. No Google secret or session token belongs in frontend environment variables. Google configuration is obtained from the backend challenge endpoint.

These commands are operator instructions, not checks performed for 1.3.0. See the [manual testing guide](../docs/testing/MANUAL_TESTING_GUIDE.md).

The production output is dist, including self-hosted PDF.js worker, CMaps, fonts and WASM assets. Deploy those assets together; do not rewrite missing asset requests to index.html. Both frontend and backend import the repository-level shared/themes.js, so keep the shared directory in build contexts.

Configure SPA route fallback and a real /api proxy at your static host; Vite's development proxy is not deployed.

Code ownership: src/pages for routes/layouts; components for shared UI; features/admin for CMS/resume/theme forms; features/media for shared uploads, pickers and the library; features/showroom for iframe lifecycle; context for public data/auth/theme; hooks for boundary navigation; lib for API and safe content helpers; styles for base/theme tokens.

Cloudinary secrets are backend-only. Media images use hydrated reference URLs; private PDF preview is an authenticated backend request. The shared ResumeViewer powers admin/public rendering. The Showroom remains non-scrollable while parent-chrome wheel/touch gestures navigate between routes.

See the canonical [frontend architecture](../docs/FRONTEND.md), [themes](../docs/THEMES.md), [CMS guide](../docs/CMS.md), [showroom contract](../docs/SHOWROOM.md), and [testing](../docs/TESTING.md).
