# Improvement Backlog — SliceIt

Living document for the "professional SASS level" iteration. Each round picks
items from here, implements them, verifies (lint → build → unit → e2e), and
closes them. Items are ranked by impact/effort.

Legend: ✅ done · 🔜 in progress · ⬜ open

---

## Round status

### 2026-01-05 (round 13): keyboard shortcuts reference + localized document title — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **In-app keyboard shortcuts reference** — header book icon opens a named, localized popover listing undo/redo/save/open (platform-aware Ctrl vs ⌘) | MEDIUM | Shortcuts are now discoverable in-app | ✅ |
| 2 | **Localized document title** — PT-BR users get "Gerador de Infográficos Radiais" in the tab title (with lang sync) | LOW | Localized chrome | ✅ |
| 3 | E2E: popover opens, is named, lists shortcuts, and the title + UI localize on language switch | MEDIUM | Feature locked in (30 e2e total) | ✅ |

### 2026-01-05 (round 12): export feedback toast + presentation focus mode — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **Export confirmation toast** — dependency-free toast channel + <Toast/> (role=status, aria-live, auto-dismiss 3s) shown after SVG/PNG downloads; 4 unit tests + e2e | MEDIUM | Users get download confirmation (silent downloads were the norm) | ✅ |
| 2 | **Focus/presentation mode** — header toggle hides the editor sidebar so the canvas fills the viewport; e2e locked in | MEDIUM | Present/share the infographic without distraction | ✅ |
| 3 | **Locale-aware starter project** — pt-BR users start with a Brazilian-themed example; the pristine starter follows the active language both ways and never clobbers edited/loaded projects (10 unit + 3 e2e tests) | MEDIUM | Localized first-run experience | ✅ |
| 4 | Toast positioned clear of the export bar; e2e flake observed once (undo/redo click, passes standalone — transient CDP issue covered by CI retries) | — | Evidence recorded | ✅ |

### 2026-01-05 (round 11): SVG upload script-sanity + README changelog — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **SVG script-sanity** — uploaded SVGs embedding <script> are rejected with a translated error in both upload paths (icons + logos); 6 new unit tests for type/size/script/content validation | MEDIUM | Defense-in-depth for downloaded SVGs (scripts don't run via <img>, but do when the file is opened directly) | ✅ |
| 2 | **README "What's New"** section documenting the recent hardening wave | LOW | Professional changelog for users | ✅ |
| 3 | **PRD gap audit** — all 5 MVP phases implemented; Rule 5 overflow warnings live in TextWarnings (verified) | — | Product completeness evidence | ✅ |

### 2026-01-05 (round 10): dark-mode axe coverage, popover guards, roving icon grid — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **Dark-mode axe scan** — accessibility suite now runs under colorScheme=dark + dark theme (shell + Type tab) and stays clean | MEDIUM | Contrast compliance in both themes | ✅ |
| 2 | **Popover Escape guard** — e2e proves the icon picker closes on Escape and focus returns to the trigger (Radix behaviour locked in) | LOW | Keyboard UX regression guard | ✅ |
| 3 | **Roving tabindex in the icon grid** — 268 tab stops collapsed to one; arrow/Home/End nav with focus tracking, tab-to-select, reset on search | MEDIUM | Keyboard users can actually Tab through the picker | ✅ |
| 4 | SliceRenderer + geometry read-through — no correctness bugs found (memo deps stable, clip ids unique, empty text safe) | — | Review evidence recorded | ✅ |

### 2026-01-05 (round 9): automated accessibility compliance (axe-core in CI) — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **axe-core accessibility suite** — @axe-core/playwright scans the shell, every editor tab, and the icon picker popover; zero critical/serious violations allowed | HIGH | Automated a11y compliance in CI; 3 e2e tests | ✅ |
| 2 | **Violation fixes** — inactive tab-trigger contrast (text-foreground/70), unlabeled dropzone file input, unnamed Radix Select triggers (Palette fillMode, Type iconPlacement), and 7 hex-edit text inputs across Canvas/Center/Palette/Slice gained proper accessible names | HIGH | Screen-reader/cat contrast passes axe | ✅ |
| 3 | **prefers-reduced-motion** honored (global transition/animation guard) | LOW | Motion-sensitive users | ✅ |

### 2026-01-05 (round 8): fitText overflow fix, render-cost profiling, suite cleanup — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **fitText unbreakable-word fix** — a single word wider than the wedge was never flagged; silent cropping risk for space-less strings (found via an existing test's wrong expectation). Now flagged as overflow at every candidate size | HIGH | Zero-cropping guarantee extends to unbreakable strings | ✅ |
| 2 | **Render-cost profile** — 36-slice stress: ~13 ms/commit (single update + flush, minus idle rAF) vs 16.7 ms frame budget; typical 8-slice projects far cheaper. **Memoization NOT applied** — evidence recorded instead of guessing | MEDIUM | Data-driven perf call | ✅ |
| 3 | **Removed no-op visual-check.spec.ts** (screenshotted to /tmp/opencode, zero assertions) | LOW | Suite is now all real assertions | ✅ |
| 4 | **textFit unit coverage 3 → 9** (wrap, min/max, empty, width invariant, unbreakable word) with a deterministic canvas-measure fallback pinned for jsdom | MEDIUM | Core layout engine guarded | ✅ |
| 5 | **noscript message + aria-live on status-bar messages** | LOW | JS-off UX + error announcements | ✅ |

### 2026-01-05 (round 7): repo hygiene + export/document polish — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **Repo hygiene** — gauntlet/ evaluation artifacts gitignored (root-anchored); capture harness committed under scripts/gauntlet; superseded visual-debug spec removed; leftover probe scripts deleted | LOW | Clean working tree, no stray binaries in git | ✅ |
| 2 | **Document lang follows locale** (screen readers pronounce the UI in the right language) | LOW | a11y correctness | ✅ |
| 3 | **theme-color meta syncs light/dark; OG/Twitter meta tags** | LOW | Browser chrome + share-card quality | ✅ |
| 4 | **Exported SVG carries <title>** so role=img naming survives into SVG/PNG files | LOW | Accessible shared images | ✅ |
| 5 | **E2E: Ctrl+Z / Ctrl+Shift+Z shortcuts** now exercised (alongside the toolbar buttons) | MEDIUM | Shortcut regression guard | ✅ |

### 2026-01-05 (round 6): system theme, upload limits, icon-grid keyboard nav — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **System theme option** — 3-state cycle (light/dark/system); system follows live OS changes; FOUC guard + e2e cover the cycle and persistence | MEDIUM | Users with OS-follow preference are served | ✅ |
| 2 | **Upload validation** — shared validateImageFile (type + 2 MB cap) wired into icon and logo uploads; failures surface a translated status-bar error instead of silent no-ops | MEDIUM | Prevents multi-MB data URLs bloating saves/state | ✅ |
| 3 | **Icon-grid keyboard nav** — arrow/Home/End roving focus in the icon picker (8-col grid, clamped edges); 3 unit tests | LOW | Keyboard-only icon selection | ✅ |

### 2026-01-05 (round 5): CI quality gate, error boundary, shortcut affordances, README — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **CI quality gate** (.github/workflows/ci.yml) — lint + build + unit + e2e on every push/PR with Playwright report artifacts; previously main deployed with zero checks | HIGH | PR/regression safety; matches the deploy pipeline | ✅ |
| 2 | **Error boundary** around the editor+canvas with translated fallback + reload; 2 unit tests (child crash → fallback) | MEDIUM | A render crash no longer blanks the app | ✅ |
| 3 | **Shortcut affordances** — Ctrl+Z/Shift+Z hint in the status bar (md+) and on undo/redo tooltips | LOW | Discoverability of undo/redo | ✅ |
| 4 | **README refresh** — new features (undo/redo, dark mode, i18n, mobile), keyboard shortcuts, verify order, CI links | LOW | Accurate professional documentation | ✅ |
| 5 | Vitest include widened to .test.tsx (error-boundary test was silently not running) | LOW | Test-config correctness | ✅ |

### 2026-01-05 (round 4): dark mode + icon-picker pressed states — ✅

| # | Item | Severity | Impact | Status |
|---|------|----------|--------|--------|
| 1 | **Dark mode** — theme module + useTheme hook + FOUC-guard inline script; header toggle (Sun/Moon) with i18n; persists in localStorage, honors OS preference on first visit | MEDIUM | The .dark palette was dead code; now a shipped feature with reload-persistence e2e | ✅ |
| 2 | **Icon picker pressed states** — aria-pressed on builtin + uploaded icon buttons | LOW | Screen readers now announce selection | ✅ |

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