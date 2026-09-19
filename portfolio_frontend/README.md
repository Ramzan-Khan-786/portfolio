# Portfolio frontend

React 18, React Router, Vite, Tailwind utilities, Lucide icons, and component-specific CSS. This directory contains the public portfolio, account screens, and admin CMS.

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd test
npm.cmd run build
```

Run from this directory. The default development /api proxy targets localhost:5000. See [.env.example](.env.example); VITE variables are public. No Google secret or session token belongs in frontend environment variables. Google configuration is obtained from the backend challenge endpoint.

The production output is dist. Configure SPA route fallback and a real /api proxy at your static host; Vite's development proxy is not deployed.

Code ownership: src/pages for routes/layouts; components for shared UI; features/admin for CMS forms; features/showroom for iframe lifecycle; context for public data/auth/theme; hooks for boundary navigation; lib for API and safe content helpers; styles for base/theme tokens.

See the canonical [frontend architecture](../docs/FRONTEND.md), [themes](../docs/THEMES.md), [CMS guide](../docs/CMS.md), [showroom contract](../docs/SHOWROOM.md), and [testing](../docs/TESTING.md).
