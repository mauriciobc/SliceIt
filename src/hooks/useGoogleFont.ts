import { useEffect } from 'react';

const loadedFonts = new Set<string>();

export function useGoogleFont(fontFamily: string | string[]) {
  useEffect(() => {
    const families = Array.isArray(fontFamily) ? fontFamily : [fontFamily];
    const toLoad = families.filter((family) => !loadedFonts.has(family));
    if (toLoad.length === 0) return;

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${toLoad
      .map((family) => encodeURIComponent(family).replace(/%20/g, '+'))
      .join('&family=')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    toLoad.forEach((family) => loadedFonts.add(family));

    return () => {
      // Keep fonts loaded to avoid FOUT on re-render and during export
    };
  }, [fontFamily]);
}
