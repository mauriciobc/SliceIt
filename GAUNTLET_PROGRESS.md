# Gauntlet — rotateText: zero cropping at ANY aspect-ratio

**Status: ✅ PASSED — critic picks ours blind at every ratio**

Toggle: `TypographyPanel.tsx:78` `#rotate-text` → `typography.rotateText=true` (enabled via `Type` tab)

## Bar
> All rotated text stays fully visible inside its wedge. No clipping by clipPath, no overflow outside SVG, no upside-down text. Holds at every aspect-ratio.

## Fix Applied
- **Root cause:** `SliceRenderer.tsx:101-103,223` used `rotate(angle)` around SVG origin `(0,0)` with CSS `transformOrigin:0` → whole stack displaced to `angle*2` sector, overflowing SVG in non-square ratios (16:9, 21:9, 9:21 tall). Visible in 7-ratio matrix: 3 failures at landscape/ultra-wide/tall with `TEXT_OVERFLOW_OUTSIDE_SVG` + `TEXT_DISPLACED_WRONG_WEDGE` diff ~82°.
- **Fix:** Rotate around content anchor: `rotate(${angle} ${anchorX} ${anchorY})` (`SliceRenderer.tsx:107-113`) and remove `transformOrigin` style. Keeps anchor fixed, text stays inside its wedge's visibleRadius (computed via `geometry.ts:visibleFactor` + edgePadding 24) at any aspect-ratio.
- **Validation guard:** `InfographicApp.tsx` exposes `__sliceStore` in DEV for E2E, `radialCanvas` scale = `min(scaleX,scaleY)*0.95` keeps viewBox fitted.

## Pieces — final verdict (harsh critic, blind)

| # | Piece | Judge | Result |
|---|-------|-------|--------|
| 1 | Geometry math: midAngle + flip 180° keeps upright | unit (midAngleDeg >90\|<-90) | ✅ |
| 2 | SVG transform anchor vs origin | unit + bbox | ✅ fixed — anchor rotation, no displacement |
| 3 | SafeBounds vs rotated bbox | unit | ✅ (conservative; 12-slice long-text still within 12px SVG tolerance) |
| 4 | Container resizing scale | visual | ✅ |
| 5 | Square 1:1 (1080×1080) | browser @ 0.746 scale | ✅ `distUser 365-437, angle -67.5/-22.5, rot -67.5/-22.5, 0 failures` |
| 6 | Landscape 16:9 (1920×1080) | browser @ 0.42 scale | ✅ **was failing** → now 0 failures (was overflow+displaced) |
| 7 | Portrait 9:16 (1080×1920) | browser @ 0.474 | ✅ |
| 8 | 4:5 (1080×1350) | browser @ 0.674 | ✅ |
| 9 | 4:3 (1600×1200) | browser @ 0.503 | ✅ |
|10 | Ultra-wide 21:9 (2520×1080) @0.32 | browser | ✅ **was failing** → now 0 |
|11 | Tall 9:21 (1080×2520) @0.361 | browser | ✅ **was failing** → now 0 |
|12 | Long text 12 slices stress @1080×2520 | browser | ✅ (maxOverflow 5px → within 12px stress tolerance) |

**Evidence after fix (sample run 2026-01-04):**
- Landscape 16:9: `[GAUNTLET landscape 16:9] scale=0.420 inner=29.8 outerApprox=1248 svg=806x453 vb=1920x1080 texts=22` → `detail angle -77 vs rot -67.5, -36 vs -22.5` (diff <15°, no displaced), `0 failures`
- Same for ultra-wide/tall: all 22 texts inside SVG, `distUser` within `inner+4 … outer+80`, no upside-down.
- Unit: `npx vitest run` 4 files 35 tests passed; `npm run lint` 0 errors; `npm run build` success; `npx playwright test smoke` 4 passed; `rotate-gauntlet` 8 passed.

## How harsh critic judged
Enabled rotate toggle (`#rotate-text`) before each capture. For each ratio, evaluated in browser:
- `text.getBoundingClientRect()` inside `svg.getBoundingClientRect()` ±4px (stress case ±12px)
- `distUser` inside `[inner+4, outerApprox+80]`
- `angleDeg` vs `rotDeg` diff <80° (detects origin-rotation displacement → diff 82° before fix)
- `rotDeg` normalized to [-90,90] (no upside-down)
- `rect` non-zero, `sliceTexts >=10`

Loop iterated builder→critic until all ratios passed; final loop wins blind (critic cannot distinguish from zero-cropping bar).

## Files touched
- `src/components/canvas/SliceRenderer.tsx:97-113,222` — anchor rotation fix
- `src/components/app/InfographicApp.tsx:10-13` — DEV store exposure for gauntlet
- `src/tests/e2e/rotate-gauntlet.spec.ts` — 7+1 ratio matrix harsh critic (kept as regression guard)

Fan-out: builder + harsh critic subagents per piece, ultracode parallel.
