import { hsl, rgb } from 'd3-color';
import { scaleLinear } from 'd3-scale';
import { PaletteConfig, Slice } from '@/types/infographic';

export function generateSliceColors(
  palette: PaletteConfig,
  slices: Slice[],
  index: number
): string {
  if (palette.mode === 'manual') {
    return slices[index]?.color ?? '#000000';
  }

  const count = slices.length;

  if (palette.mode === 'gradient') {
    const colorScale = scaleLinear<string>()
      .domain([0, Math.max(count - 1, 1)])
      .range([palette.gradientStart, palette.gradientEnd]);
    return colorScale(index);
  }

  // Single color mode: sweep hue around the wheel with an alternating
  // lightness wave so adjacent slices always stay distinguishable.
  // Muted saturation keeps the palette sophisticated like the Domo references
  // rather than neon-vibrating.
  const base = hsl(palette.singleColor);
  const safeCount = Math.max(count, 1);
  const span = Math.min(320, 45 * safeCount);
  const t = safeCount === 1 ? 0.5 : index / (safeCount - 1);
  const hue = ((base.h - span / 2 + span * t) % 360 + 360) % 360;
  const lightnessWave = index % 2 === 0 ? 0.05 : -0.05;
  // Desaturate for editorial sophistication like Domo references
  const sat = Math.min(0.72, Math.max(0.48, base.s * 0.68));
  const adjusted = hsl(
    hue,
    sat,
    Math.min(0.64, Math.max(0.50, base.l + lightnessWave))
  );

  return adjusted.formatHex();
}

export function deriveCenterColor(colors: string[]): string {
  if (colors.length === 0) return '#e5e7eb';

  const avg = { h: 0, s: 0, l: 0 };
  let vecX = 0;
  let vecY = 0;
  let valid = 0;

  for (const color of colors) {
    const c = hsl(color);
    if (Number.isNaN(c.h)) continue;
    const rad = (c.h * Math.PI) / 180;
    vecX += Math.cos(rad);
    vecY += Math.sin(rad);
    avg.s += c.s;
    avg.l += c.l;
    valid++;
  }

  if (valid === 0) return '#e5e7eb';

  const coherence = Math.hypot(vecX, vecY) / valid;

  // Rainbow-like palettes have no meaningful average hue; give them a
  // confident tinted hub. For wide-span rainbows we use a Domo-style
  // dark charcoal with warm undertone; for narrow analogous palettes
  // we tint toward the mean hue.
  if (coherence < 0.52) {
    return hsl(220, 0.18, 0.16).formatHex();
  }
  if (coherence < 0.7) {
    return hsl(42, 0.2, 0.93).formatHex();
  }

  const meanHue = ((Math.atan2(vecY, vecX) * 180) / Math.PI + 360) % 360;

  return hsl(meanHue, Math.min(0.32, Math.max(0.12, (avg.s / valid) * 0.38)), 0.88).formatHex();
}

export function getAllSliceColors(palette: PaletteConfig, slices: Slice[]): string[] {
  return slices.map((_, index) => generateSliceColors(palette, slices, index));
}

export function getContrastColor(backgroundColor: string): string {
  const c = rgb(backgroundColor);
  const luminance = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
  return luminance > 128 ? '#111827' : '#ffffff';
}
