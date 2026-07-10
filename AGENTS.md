# SliceIt --- Agent Guide

## Quick commands

```bash
npm run dev              # Vite dev server on :5173
npm run build            # tsc -b && vite build
npm run lint             # ESLint (src/**/*.{ts,tsx})
npx vitest run           # Unit tests only
npx vitest run <path>    # Single test file
npx playwright test      # E2E (auto-starts dev server if not running)
```

## Verify order

1. `npm run lint`
2. `npm run build` (includes tsc)
3. `npx vitest run` (fast, local)
4. `npx playwright test` (starts dev server automatically)

## Architecture

- Single Vite app, no monorepo.
- `@/` alias --> `src/` (set in vite.config.ts and tsconfig.app.json).
- State: Zustand + Immer in `src/store/useProjectStore.ts`.
- Domain types in `src/types/infographic.ts`.
- Pure logic in `src/lib/` (geometry, palette, text fit, export, parsers).
- SVG rendering components in `src/components/canvas/`.
- Sidebar editors in `src/components/editor/`.
- shadcn/ui primitives in `src/components/ui/`.

## Testing

- **Unit**: Vitest + jsdom. Tests in `src/tests/unit/**/*.test.ts`. Setup file: `src/tests/setup.ts` (imports `@testing-library/jest-dom/vitest`).
- **E2E**: Playwright (Chromium only). Tests in `src/tests/e2e/`. Config auto-launches dev server.
- Run a single unit test: `npx vitest run src/tests/unit/palette.test.ts`

## Style conventions

- Prettier: single quotes, semicolons, 100-char width, trailing commas `es5`, Tailwind class sorting via `prettier-plugin-tailwindcss`.
- ESLint: unused vars warn with `_` prefix, React Hooks rules enforced, `react-refresh/only-export-components` warns.
- shadcn/ui style: `new-york`, `zinc` base color, CSS variables enabled. Add new components with `npx shadcn@latest add <component>`.

## Gotchas

- `npm run build` runs `tsc -b` --- type errors block the build even if Vite would succeed.
- Vitest config uses `globals: true` --- test helpers like `describe`, `it`, `expect` are available without imports.
- Tailwind CSS v4 is used (via `@tailwindcss/postcss`), not v3 --- no `tailwind.config.js`, config lives in CSS.
- `test-results/` and `playwright-report/` are gitignored but may exist after test runs.
