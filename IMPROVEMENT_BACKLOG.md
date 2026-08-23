# Improvement Backlog — SliceIt

Living document for the "professional SASS level" iteration. Each round picks
items from here, implements them, verifies (lint → build → unit → e2e), and
closes them. Items are ranked by impact/effort.

Legend: ✅ done · 🔜 in progress · ⬜ open

---

## Round status

### 2026-01-05 (round 3): mobile responsiveness + validation coverage + data-workflow e2e — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **Mobile responsive layout** — editor stacks above canvas below lg (was a fixed 384px sidebar with no small-screen strategy); export bar wraps; header condenses | HIGH | App is usable down to phone viewports (390×844 verified) | ✅ |
| 2 | **Validation coverage** — 6 unit tests for slice-count warnings/errors (min/recommended/hard-cap guards) | MEDIUM | Thresholds are now guarded in CI | ✅ |
| 3 | **Data-workflow e2e** — CSV import, save→load round-trip fidelity, mobile-viewport usability | MEDIUM | 3 new e2e tests (19 total) | ✅ |

### 2026-01-05: undo/redo + tolerant project loading + subscription hygiene — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **Undo/redo** — pure history lib (coalescing drags into one step, 30-entry cap) wired into every store action; toolbar buttons + Ctrl/Cmd+Z / Shift+Z / Y shortcuts (guarded while typing) | HIGH | Biggest UX gap closed; 10 pure + 10 integration tests + e2e | ✅ |
| 2 | **Tolerant project loading** — legacy sections missing newer fields are merged over defaults; invalid files now surface `actions.invalidFile` in the status bar instead of failing silently | HIGH | Save-files from older versions open instead of throwing | ✅ |
| 3 | **ProjectActions wide-subscription fix** — was subscribing to the ENTIRE store (re-render on every edit); now 8 narrow selectors | MEDIUM | Removes a whole-app re-render source | ✅ |

### 2026-01-04: bundle + lint hygiene + serializer coverage — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | Bundle: kill the 1 MB single chunk (entry 1090 kB → 57 kB; total ~670 kB) | HIGH | 38% smaller app | ✅ |
| 2 | Code-split editor tab panels via React.lazy — each loads on first tab activation | HIGH | Initial route ships only the shell + vendors | ✅ |
| 3 | Defer export modules (html-to-image, file-saver) behind dynamic import | HIGH | Export stack not in the initial bundle | ✅ |
| 4 | Defer papaparse behind dynamic import on first CSV drop | MEDIUM | CSV parser not in the initial bundle | ✅ |
| 5 | Tree-shake lucide-react: curated 268-icon set instead of the full registry | HIGH | ui-vendor 590 kB → 158 kB | ✅ |
| 6 | Clean ESLint: 5 react-refresh warnings → 0 (i18n split; toggleVariants → own module) | LOW | clean npm run lint | ✅ |
| 7 | projectSerializer unit tests (round-trip, defaults, legacy partial, structural rejection) | MEDIUM | 6 new tests guarding save→reload | ✅ |

## Open backlog

### Performance & architecture
- ⬜ HIGH: radial canvas re-renders on every store change — profile selector subscriptions; memoize per-slice computation in SliceRenderer (geometry + text fit recomputed per render).
- ⬜ HIGH: duplicated geometry math between geometry.ts and inline computations in SliceRenderer.tsx — extract remaining magic numbers (gap 0.04, nudge clamp 0.22, edge paddings) into named exports.
- ⬜ MEDIUM: React.memo for RadialCanvas / icon chips; unrelated editor edits trigger needless re-renders.
- ⬜ MEDIUM: react-vendor chunk is 190 kB — revisit after React 19 library upgrades.

### Robustness & data
- ⬜ HIGH: validateProject throws on legacy payloads missing required fields (e.g. pre-feature typography without metricFont). Add a version-keyed migration layer (fill defaults → bump version → coerce) instead of hard failure, with a friendly "loaded with defaults" notice.
- ⬜ MEDIUM: uploaded image size/type limits are not enforced (only accept attrs) — cap ~2 MB and reject huge data URLs before they bloat saves.
- ⬜ MEDIUM: recomputeValidation has no unit tests; text-overflow warning thresholds are untested against exported SVG.

### UX & accessibility
- ⬜ MEDIUM: keyboard accessibility of the icon picker grid (arrow-key navigation, roving tabindex) and color inputs.
- ⬜ MEDIUM: #radial-canvas SVG has no role="img" + aria-label summary; exported SVGs should carry the same.
- ⬜ LOW: audit remaining *Hint* translation strings for clarity (Icon Margin hint was just rewritten).

### Testing & CI
- ⬜ MEDIUM: e2e lacks coverage for CSV import (dynamic papaparse path) and save→load→restore fidelity.
- ⬜ MEDIUM: e2e screenshot flake observed once ("Unable to capture screenshot", headless CDP) — mitigated by CI retries; watch test-results/ for recurrence.
- ⬜ LOW: visual-debug.spec.ts and gauntlet/ + scripts/ are untracked working artifacts — decide to commit or gitignore.

## Proposed next round (highest leverage)
1. Serializer migration layer + friendly load error surface (robustness gap).
2. SliceRenderer memoization + extract remaining geometry constants.
3. Undo/redo history (biggest UX gap for a professional editor).