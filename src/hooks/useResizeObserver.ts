import { useEffect, useState, RefObject } from 'react';

export function useResizeObserver(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);
    setSize({ width: element.clientWidth, height: element.clientHeight });

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return size;
}
