async function fontFileToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk))
    );
  }
  const mime = res.headers.get('content-type') || 'font/woff2';
  return `data:${mime};base64,${btoa(binary)}`;
}

function googleFontsUrl(families: string[]): string {
  const list = families
    .filter(Boolean)
    .map((f) => encodeURIComponent(f).replace(/%20/g, '+'))
    .join('&family=');
  return `https://fonts.googleapis.com/css2?family=${list}&display=swap`;
}

export async function embedGoogleFonts(
  svg: SVGSVGElement,
  families: string[]
): Promise<void> {
  const unique = Array.from(new Set(families.filter(Boolean)));
  if (unique.length === 0) return;

  let css: string;
  try {
    const res = await fetch(googleFontsUrl(unique));
    css = await res.text();
  } catch {
    return;
  }

  const fontFaceBlocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
  const inlined = await Promise.all(
    fontFaceBlocks.map(async (block) => {
      const urls = Array.from(block.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)).map(
        (m) => m[1]
      );
      let result = block;
      for (const url of urls) {
        try {
          const dataUrl = await fontFileToDataUrl(url);
          result = result.replace(`url(${url})`, `url(${dataUrl})`);
        } catch {
          // Font loading failure is non-critical; skip this URL
        }
      }
      return result;
    })
  );

  if (inlined.length === 0) return;

  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.setAttribute('type', 'text/css');
  style.textContent = inlined.join('\n');

  const defs =
    svg.querySelector('defs') ??
    (() => {
      const d = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.prepend(d);
      return d;
    })();
  defs.prepend(style);
}
