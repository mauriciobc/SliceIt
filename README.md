# SliceIt — Radial Infographic Generator

A standalone web application for infrastructure analysts to generate customizable
radial infographics. No backend or authentication required. Works on desktop and
mobile.

## Features

- SVG-first rendering engine with automatic wedge generation
- Aspect ratios: 1:1, 4:5, 16:9, 9:16, 4:3, and custom dimensions
- Center wheel with title, subtitle, footer caption, and logo support
- Three palette modes: single color, gradient, and manual per-slice colors
- Text layout engine: horizontal text, auto-wrap, auto-scale, overflow detection
- **Rotated radial text with zero cropping at any aspect ratio**
- Built-in icon library (Lucide) with search, SVG/PNG uploads, per-slice overrides
- CSV and JSON import; SVG and PNG export with font embedding
- **Save/load projects as JSON with tolerant loading of older save files**
- **Undo/redo** (toolbar buttons or `Ctrl+Z` / `Ctrl+Shift+Z`)
- **Dark mode** with persistent preference and OS-preference fallback
- **Internationalization**: English and Portuguese (BR)
- **Responsive layout** — editor stacks above the canvas on phones
- Google Fonts integration

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd+Z` | Undo |
| `Ctrl/Cmd+Shift+Z`, `Ctrl/Cmd+Y` | Redo |
| `Ctrl/Cmd+S` | Save project JSON |
| `Ctrl/Cmd+O` | Open project JSON |

Shortcuts are ignored while typing in inputs so native text editing keeps working.

## Tech Stack

- React 19 + TypeScript
- Vite (Rolldown) with vendor code splitting — ~57 kB initial JS
- Tailwind CSS + shadcn/ui primitives
- Zustand + Immer (undo/redo via coalescing history)
- d3-shape / d3-color
- PapaParse, react-dropzone, html-to-image, file-saver
- Vitest + Playwright

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production (tsc + vite) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npx vitest run` | Run unit tests |
| `npx playwright test` | Run E2E tests (auto-starts dev server) |

## Verify Order

Before merging changes, run in this order (CI runs the same checks):

1. `npm run lint`
2. `npm run build`
3. `npx vitest run`
4. `npx playwright test`

## Project Structure

```
src/
  components/
    app/          # App shell, error boundary
    canvas/       # SVG rendering components
    editor/       # Sidebar editors
    export/       # Export and project actions (toolbar)
    layout/       # Header and status bar
    ui/           # shadcn/ui primitive components
  hooks/          # Custom React hooks (theme, fonts, resize)
  lib/            # Geometry, palette, text fit, history, export, parsers
  store/          # Zustand store (produce-based, undo/redo aware)
  tests/          # Unit (Vitest) and E2E (Playwright) tests
  types/          # TypeScript domain types
```

## Import Formats

### CSV

```csv
metric,label,color
46M,API Calls,#0099FF
12K,Incidents,#11CC66
```

### JSON

```json
{
  "title": "EVERY MINUTE",
  "slices": [
    { "metric": "46M", "label": "API Calls", "color": "#0099FF" }
  ]
}
```

Projects saved from the app include icons, per-slice overrides and uploaded
assets; older files missing newer fields are merged with current defaults on
load instead of failing.

## Self-hosting with Portainer

SliceIt is a static SPA (no backend) and ships with a multi-stage `Dockerfile` that
builds with Node and serves the bundle via Caddy. Deploy it as a Portainer stack
directly from this GitHub repository:

1. In Portainer: **Stacks → Add stack → Build method: Repository**.
2. Repository URL: `https://github.com/mauriciobc/SliceIt.git`, branch `main`.
3. Portainer auto-detects `docker-compose.yml` and builds the image. Click **Deploy**.
4. Access the app at `http://<your-server-ip>:3500` (host port `3500` → container `80`).

To serve over HTTPS with a domain, change the site address in `Caddyfile` from
`:80` to your domain (e.g. `sliceit.example.com`) and Caddy provisions TLS
automatically.

## Quality Gates

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs lint, build, unit
  and E2E tests on every push/PR and uploads the Playwright report on failure.
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publishes the
  built app to GitHub Pages on `main`.

## License

MIT
