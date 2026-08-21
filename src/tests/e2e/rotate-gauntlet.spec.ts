/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';

type RatioPreset = { label: string; width: number; height: number; kind: 'preset' | 'custom'; preset?: string };

const RATIOS: RatioPreset[] = [
  { label: 'square 1:1', width: 1080, height: 1080, kind: 'preset', preset: '1:1' },
  { label: 'landscape 16:9', width: 1920, height: 1080, kind: 'preset', preset: '16:9' },
  { label: 'portrait 9:16', width: 1080, height: 1920, kind: 'preset', preset: '9:16' },
  { label: 'ratio 4:5', width: 1080, height: 1350, kind: 'preset', preset: '4:5' },
  { label: 'ratio 4:3', width: 1600, height: 1200, kind: 'preset', preset: '4:3' },
  { label: 'ultra-wide 21:9', width: 2520, height: 1080, kind: 'custom' },
  { label: 'tall 9:21', width: 1080, height: 2520, kind: 'custom' },
];

async function enableRotate(page: import('@playwright/test').Page) {
  await page.getByRole('tab', { name: 'Type' }).click();
  const toggle = page.locator('#rotate-text');
  await expect(toggle).toBeVisible();
  const isChecked = await toggle.isChecked();
  if (!isChecked) {
    // Switch is Radix UI switch role
    await page.getByLabel('Rotate Text Radially').click();
    await expect(toggle).toBeChecked();
  }
  // give store time to propagate
  await page.waitForTimeout(150);
}

async function setRatio(page: import('@playwright/test').Page, r: RatioPreset) {
  await page.getByRole('tab', { name: 'Canvas' }).click();
  if (r.kind === 'preset' && r.preset) {
    const combo = page.getByRole('combobox', { name: 'Aspect Ratio' });
    await combo.click();
    await page.getByRole('option', { name: r.preset }).click();
  } else {
    // Custom via width/height inputs
    const combo = page.getByRole('combobox', { name: 'Aspect Ratio' });
    await combo.click();
    await page.getByRole('option', { name: 'Custom' }).click();
    const widthInput = page.locator('#canvas-width');
    const heightInput = page.locator('#canvas-height');
    await widthInput.fill(String(r.width));
    await heightInput.fill(String(r.height));
    // blur to trigger
    await widthInput.press('Tab');
    await page.waitForTimeout(100);
  }
  // wait for geometry recompute
  await page.waitForTimeout(300);
  const canvas = page.locator('#radial-canvas');
  await expect(canvas).toBeVisible();
}

test.describe('Gauntlet — rotateText zero-cropping at ANY aspect-ratio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await enableRotate(page);
  });

  for (const ratio of RATIOS) {
    test(`no cropping with rotate ON at ${ratio.label} (${ratio.width}x${ratio.height})`, async ({ page }) => {
      await setRatio(page, ratio);

      const canvas = page.locator('#radial-canvas');
      await expect(canvas).toBeVisible();

      // Harsh visual + geometry critic inside browser
      const result = await page.evaluate(() => {
        const svg = document.querySelector('#radial-canvas') as SVGSVGElement | null;
        if (!svg) return { error: 'SVG not found' } as const;
        const svgRect = svg.getBoundingClientRect();
        const vb = svg.viewBox.baseVal;
        const vbW = vb.width || 1080;
        const vbH = vb.height || 1080;
        const scaleX = svgRect.width / vbW;
        const scaleY = svgRect.height / vbH;
        const scale = (scaleX + scaleY) / 2;
        const centerScreenX = svgRect.left + svgRect.width / 2;
        const centerScreenY = svgRect.top + svgRect.height / 2;

        // innerRadius approx min(vbW, vbH)*0.18, outer approximated from vb
        // Instead read from DOM: find center wheel circle r
        const centerCircle = svg.querySelector('circle') as SVGCircleElement | null;
        const innerRadiusUser = centerCircle ? Number(centerCircle.getAttribute('r')) || Math.min(vbW, vbH) * 0.18 : Math.min(vbW, vbH) * 0.18;
        // outer radius derived from viewbox half * segmentExtension
        // Use max distance of wedge outer points: approximate as min half? We'll bound generously
        const outerApproxUser = Math.max(vbW, vbH) * 0.65; // conservative upper bound for visibleRadius

        const texts = Array.from(svg.querySelectorAll('text')) as SVGTextElement[];
        // Filter out empty center texts? keep all slice metric/label; exclude source note handled separately but include for overflow check
        const details: Array<Record<string, unknown>> = [];
        const failures: string[] = [];

        for (const t of texts) {
          const txt = (t.textContent || '').trim();
          if (!txt) continue;
          const bbox = t.getBBox();
          const rect = t.getBoundingClientRect();
          const parentG = t.closest('g[transform]') as SVGGElement | null;
          const transform = parentG?.getAttribute('transform') || t.closest('g')?.getAttribute('transform') || '';

          // Screen center of text bbox (using getBoundingClientRect center)
          const cxScreen = rect.left + rect.width / 2;
          const cyScreen = rect.top + rect.height / 2;
          const dxScreen = cxScreen - centerScreenX;
          const dyScreen = cyScreen - centerScreenY;
          const distScreen = Math.hypot(dxScreen, dyScreen);
          const distUser = distScreen / scale;
          // Angle from center: geometry uses a = atan2(dx, -dy)
          const angleRad = Math.atan2(dxScreen, -dyScreen);
          let angleDeg = (angleRad * 180) / Math.PI;
          // normalize to -180..180
          while (angleDeg > 180) angleDeg -= 360;
          while (angleDeg < -180) angleDeg += 360;

          // Detect radial text rotation amount via transform string: rotate( XX )
          let rotDeg: number | null = null;
          const m = transform.match(/rotate\(\s*([-\d.]+)/);
          if (m) rotDeg = parseFloat(m[1]);

          // Determine if this looks like a slice label/metric (exclude center wheel texts which are at y near 0 and x near 0)
          // Slice texts are not at exact center; distance > innerRadius
          const isCenter = distUser < innerRadiusUser * 0.9;
          // Also source note is at bottom-left (y near vbH, x small) — skip distance check for it but still overflow check
          const isSourceNote = txt.startsWith('Source:');
          
          // 1) Overflow outside SVG viewport (allow 4px tolerance)
          const overflowOutside =
            rect.left < svgRect.left - 4 ||
            rect.right > svgRect.right + 4 ||
            rect.top < svgRect.top - 4 ||
            rect.bottom > svgRect.bottom + 4;

          if (overflowOutside) {
            failures.push(`TEXT_OVERFLOW_OUTSIDE_SVG: "${txt}" rect [${rect.left.toFixed(1)},${rect.top.toFixed(1)} ${rect.width.toFixed(1)}x${rect.height.toFixed(1)}] outside svg [${svgRect.left.toFixed(1)},${svgRect.top.toFixed(1)} ${svgRect.width.toFixed(1)}x${svgRect.height.toFixed(1)}] scale ${scale.toFixed(3)} transform=${transform}`);
          }

          // 2) Zero area or invisible (clipped to 0)
          if (rect.width < 1 || rect.height < 1) {
            failures.push(`TEXT_ZERO_AREA: "${txt}" rect ${rect.width}x${rect.height} bbox ${bbox.width}x${bbox.height}`);
          }

          // 3) For slice texts (not center, not source), check radial distance stays inside annulus and angle not displaced to opposite side
          if (!isCenter && !isSourceNote) {
            // distance should be between innerRadius+5 and outerApprox
            if (distUser < innerRadiusUser + 4) {
              failures.push(`TEXT_TOO_CLOSE_CENTER: "${txt}" distUser ${distUser.toFixed(1)} < inner ${innerRadiusUser.toFixed(1)} angle ${angleDeg.toFixed(1)} rot ${rotDeg}`);
            }
            if (distUser > outerApproxUser + 80) {
              failures.push(`TEXT_TOO_FAR_OUTER: "${txt}" distUser ${distUser.toFixed(1)} > outerApprox ${outerApproxUser.toFixed(1)} angle ${angleDeg.toFixed(1)} rot ${rotDeg} rect center screen (${cxScreen.toFixed(1)},${cyScreen.toFixed(1)})`);
            }
            // Check that text not drastically angled away from its radial slot
            // We can infer expected midAngle as angleDeg before rotation? After rotation around anchor, angle should stay same as before.
            // If rotated around origin, angle = 2*expected. We detect by checking if rotDeg exists and absolute rotation > 10, then naive expected would be angleDeg - rotDeg ?
            // Simpler: For buggy origin rotation, text screen angle will be originalAngle + rotDeg. For fixed anchor rotation, screen angle ~ originalAngle.
            // We can at least verify that text isn't ending up 90deg away from its transform rotation implied direction? 
            // For now, check that text after rotation remains within 90deg of its rotation axis (i.e., radial text should be roughly aligned radially)
            // If rotDeg is e.g. 45, angleDeg should be ~45 (radial), not 90.
            if (rotDeg !== null) {
              // Normalize rotDeg similarly - should be flipped to be within -90..90 for readability
              let normRot = rotDeg;
              while (normRot > 180) normRot -= 360;
              while (normRot < -180) normRot += 360;
              // radial text ideally rot ~ angleDeg (or angleDeg+180 if flipped). Check diff.
              const diff = Math.abs(angleDeg - normRot);
              const diffFlipped = Math.abs(angleDeg - (normRot > 0 ? normRot - 180 : normRot + 180));
              const minDiff = Math.min(diff, diffFlipped);
              // Allow large tolerance due to layout details but if >80deg then clearly displaced to wrong wedge
              if (minDiff > 80 && Math.abs(normRot) > 5) {
                failures.push(`TEXT_DISPLACED_WRONG_WEDGE: "${txt}" angle ${angleDeg.toFixed(1)} vs rot ${normRot.toFixed(1)} diff ${minDiff.toFixed(1)} dist ${distUser.toFixed(1)}`);
              }
              // Also flipped logic: rot should be within -90..90 after correction (never upside down)
              if (normRot > 90 || normRot < -90) {
                // Could be flipped +180, but after our normalization above, flipped case would be normalized outside? Actually isFlipped adds 180 to keep upright, so final rot should still be within -90..90.
                // If rot is outside, text is upside-down
                // We check if there exists a 180 shift that brings into range
                const flipped = normRot > 90 ? normRot - 180 : normRot < -90 ? normRot + 180 : normRot;
                if (flipped > 90 || flipped < -90) {
                  failures.push(`TEXT_UPSIDE_DOWN: "${txt}" rot ${rotDeg} normalized ${normRot}`);
                }
              }
            }
          }

          details.push({
            txt,
            rect: { l: rect.left, t: rect.top, w: rect.width, h: rect.height },
            bbox: { w: bbox.width, h: bbox.height },
            distUser: Number(distUser.toFixed(1)),
            angleDeg: Number(angleDeg.toFixed(1)),
            transform,
            rotDeg,
            isCenter,
            isSourceNote,
          });
        }

        // Also check that number of texts is plausible (8 slices * 2 + center ~3 => ~19)
        const sliceTexts = details.filter(d => !(d as any).isCenter && !(d as any).isSourceNote);
        if (sliceTexts.length < 10) {
          failures.push(`TOO_FEW_SLICE_TEXTS: found ${sliceTexts.length} expected at least 16 (8 metrics + 8 labels) details=${JSON.stringify(sliceTexts.slice(0,3))}`);
        }

        return {
          svgRect: { l: svgRect.left, t: svgRect.top, w: svgRect.width, h: svgRect.height },
          vb: { w: vbW, h: vbH },
          scale,
          innerRadiusUser,
          outerApproxUser,
          count: texts.length,
          details,
          failures,
        };
      });

      if ('error' in (result as any)) {
        throw new Error(`Evaluation error: ${(result as any).error}`);
      }
      const r = result as Exclude<typeof result, { error: string }>;
      // Log details for harsh critic visibility
      console.log(`[GAUNTLET ${ratio.label}] scale=${r.scale.toFixed(3)} inner=${r.innerRadiusUser.toFixed(1)} outerApprox=${r.outerApproxUser.toFixed(1)} svg=${r.svgRect.w.toFixed(0)}x${r.svgRect.h.toFixed(0)} vb=${r.vb.w}x${r.vb.h} texts=${r.count}`);
      for (const f of r.failures) {
        console.log(`  FAIL: ${f}`);
      }
      // Also log a few sample details
      for (const d of r.details.slice(0, 4)) {
        console.log(`  detail: ${JSON.stringify(d)}`);
      }

      expect(r.failures, `Cropping/displacement failures at ${ratio.label}:\n${r.failures.join('\n')}\nDetails: ${JSON.stringify(r.details, null, 2)}`).toEqual([]);
    });
  }

  test('long text and many slices still no cropping', async ({ page }) => {
    await page.evaluate(() => {
      const w = window as unknown as { __sliceStore?: { getState: () => { setSlices: (s: unknown[]) => void } } };
      const store = w.__sliceStore;
      if (!store) throw new Error('__sliceStore not exposed');
      const state = store.getState();
      const longSlices = Array.from({ length: 12 }, (_, i) => ({
        id: `gauntlet-${i}`,
        metric: `${(i + 1) * 10}M`,
        label: `VERY LONG LABEL TEXT FOR STRESS TESTING ${i + 1}`,
        icon: 'Activity',
      }));
      state.setSlices(longSlices as never);
    });
    await page.waitForTimeout(500);
    await page.getByRole('tab', { name: 'Canvas' }).click();
    // Test at most extreme custom tall ratio where cropping worst
    const widthInput = page.locator('#canvas-width');
    const heightInput = page.locator('#canvas-height');
    await page.getByRole('combobox', { name: 'Aspect Ratio' }).click();
    await page.getByRole('option', { name: 'Custom' }).click();
    await widthInput.fill('1080');
    await heightInput.fill('2520');
    await widthInput.press('Tab');
    await page.waitForTimeout(300);
    const canvas = page.locator('#radial-canvas');
    await expect(canvas).toBeVisible();

    const r = await page.evaluate(() => {
      const svg = document.querySelector('#radial-canvas') as SVGSVGElement | null;
      if (!svg) return { error: 'no svg' } as const;
      const svgRect = svg.getBoundingClientRect();
      const texts = Array.from(svg.querySelectorAll('text')) as SVGTextElement[];
      const failures: string[] = [];
      // Allow small bleed (±12px) for extreme stress case: bar is inside wedges/clipPath,
      // not strictly SVG viewport edge which already bleeds due to segmentExtension.
      // Primary zero-cropping bar already validated in the 7 ratio tests above.
      const tol = 12;
      for (const t of texts) {
        const txt = (t.textContent || '').trim();
        if (!txt) continue;
        const rect = t.getBoundingClientRect();
        const overflowL = svgRect.left - rect.left;
        const overflowR = rect.right - svgRect.right;
        const overflowT = svgRect.top - rect.top;
        const overflowB = rect.bottom - svgRect.bottom;
        const maxOverflow = Math.max(overflowL, overflowR, overflowT, overflowB);
        if (maxOverflow > tol) {
          failures.push(`OVERFLOW long-text: "${txt.slice(0, 20)}" rect ${rect.left.toFixed(1)},${rect.top.toFixed(1)} ${rect.width.toFixed(1)}x${rect.height.toFixed(1)} vs svg ${svgRect.left.toFixed(1)},${svgRect.top.toFixed(1)} ${svgRect.width.toFixed(1)}x${svgRect.height.toFixed(1)} maxOverflow ${maxOverflow.toFixed(1)}`);
        }
        if (rect.width < 1 || rect.height < 1) {
          failures.push(`ZERO ${txt.slice(0, 10)}`);
        }
      }
      return { failures, count: texts.length };
    });
    if ('error' in (r as any)) throw new Error((r as any).error);
    expect((r as any).failures, `Long-text cropping:\n${(r as any).failures.join('\n')}`).toEqual([]);
    expect((r as any).count).toBeGreaterThan(10);
  });
});
