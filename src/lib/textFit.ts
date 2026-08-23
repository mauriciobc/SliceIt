interface TextFitOptions {
  maxWidth: number;
  maxHeight: number;
  fontFamily: string;
  minFontSize?: number;
  maxFontSize?: number;
  lineHeightRatio?: number;
}

interface TextFitResult {
  lines: string[];
  fontSize: number;
  overflow: boolean;
}

const DEFAULT_SIZES = [40, 36, 32, 28, 24, 20, 16];

function measureText(text: string, font: string): number {
  if (typeof document === 'undefined') return text.length * 10;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return text.length * 10;

  ctx.font = font;
  return ctx.measureText(text).width;
}

function wrapText(text: string, font: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = measureText(testLine, font);

    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function fitText(
  text: string,
  options: TextFitOptions,
  fontSizes: number[] = DEFAULT_SIZES
): TextFitResult {
  const {
    maxWidth,
    maxHeight,
    fontFamily,
    minFontSize = 12,
    maxFontSize = 64,
    lineHeightRatio = 1.1,
  } = options;

  const candidateSizes = fontSizes
    .filter((size) => size >= minFontSize && size <= maxFontSize)
    .sort((a, b) => b - a);

  for (const fontSize of candidateSizes) {
    const font = `500 ${fontSize}px "${fontFamily}", system-ui, sans-serif`;
    const lines = wrapText(text, font, maxWidth);
    const lineHeight = fontSize * lineHeightRatio;
    const totalHeight = lines.length * lineHeight;
    // An unbreakable word wider than the wedge (no spaces to break on) cannot
    // be fitted by shrinking — flag it so the renderer never crops silently.
    const tooWide = lines.some((line) => measureText(line, font) > maxWidth);

    if (!tooWide && totalHeight <= maxHeight) {
      return {
        lines,
        fontSize,
        overflow: false,
      };
    }
  }

  // Fallback: smallest size, still wrapped
  const smallestFont = Math.max(...candidateSizes.slice(-1), minFontSize);
  const font = `500 ${smallestFont}px "${fontFamily}", system-ui, sans-serif`;
  const lines = wrapText(text, font, maxWidth);

  return {
    lines,
    fontSize: smallestFont,
    overflow: true,
  };
}