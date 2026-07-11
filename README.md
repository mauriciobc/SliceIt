# SliceIt — Radial Infographic Generator

A standalone web application for infrastructure analysts to generate customizable radial infographics. No backend or authentication required.

## Features

- SVG-first rendering engine with automatic wedge generation
- Multiple aspect ratios: 1:1, 4:5, 16:9, 9:16, 4:3, and custom dimensions
- Center wheel with title, subtitle, footer caption, and logo support
- Three palette modes: single color, start/end gradient, and manual per-slice colors
- Automatic center color derived from the palette
- Text layout engine: horizontal text, auto-wrap, auto-scale, overflow detection
- Built-in icon library (Lucide) and support for SVG/PNG icon uploads
- CSV and JSON import for slice data
- SVG and PNG export
- Save/load project as JSON
- Google Fonts integration

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui primitives
- Zustand + Immer
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
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npx vitest run` | Run unit tests |
| `npx playwright test` | Run E2E smoke tests |

## Project Structure

```
src/
  components/
    app/          # Top-level app shell
    canvas/       # SVG rendering components
    editor/       # Sidebar editors
    export/       # Export and project actions
    layout/       # Header and status bar
    ui/           # shadcn/ui primitive components
  hooks/          # Custom React hooks
  lib/            # Geometry, palette, text fit, export, parsers
  store/          # Zustand store
  tests/          # Unit and E2E tests
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

## License

MIT
