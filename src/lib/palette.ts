import { hsl, rgb } from 'd3-color';

function interpolateHsl(start: ReturnType<typeof hsl>, end: ReturnType<typeof hsl>) {
  return (t: number) => {
    const h = start.h + (end.h - start.h) * t;
    const s = start.s + (end.s - start.s) * t;
    const l = start.l + (end.l - start.l) * t;
    return hsl(h, s, l).formatHex();
  };
}
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
    const t = count === 1 ? 0 : index / (count - 1);
    const start = hsl(palette.gradientStart);
    const end = hsl(palette.gradientEnd);
    return interpolateHsl(start, end)(t);
  }

  // Single color mode: distribute analogous hues around the wheel
  const base = hsl(palette.singleColor);
  const hueStep = 30;
  const hueShift = ((index - count / 2) * hueStep) / Math.max(count / 2, 1);
  const adjusted = hsl(base.h + hueShift, base.s, base.l);
  return adjusted.formatHex();
}

export function deriveCenterColor(colors: string[]): string {
  if (colors.length === 0) return '#e5e7eb';

  const avg = { h: 0, s: 0, l: 0 };
  let valid = 0;

  for (const color of colors) {
    const c = hsl(color);
    if (Number.isNaN(c.h)) continue;
    avg.h += c.h;
    avg.s += c.s;
    avg.l += c.l;
    valid++;
  }

  if (valid === 0) return '#e5e7eb';

  avg.h /= valid;
  avg.s = Math.max(0, avg.s / valid - 0.1);
  avg.l = Math.min(1, avg.l / valid + 0.15);

  return hsl(avg.h, avg.s, avg.l).formatHex();
}

export function getAllSliceColors(palette: PaletteConfig, slices: Slice[]): string[] {
  return slices.map((_, index) => generateSliceColors(palette, slices, index));
}

export function getContrastColor(backgroundColor: string): string {
  const c = rgb(backgroundColor);
  const luminance = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
  return luminance > 128 ? '#111827' : '#ffffff';
}
