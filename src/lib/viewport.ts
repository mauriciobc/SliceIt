export interface PanOffset {
  x: number;
  y: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;
export const ZOOM_STEP = 0.25;
export const WHEEL_ZOOM_FACTOR = 1.1;

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

/** Round to the nearest ZOOM_STEP. */
export function stepZoom(zoom: number, direction: 1 | -1): number {
  const steps = Math.round(zoom / ZOOM_STEP) + direction;
  return clampZoom(steps * ZOOM_STEP);
}

/**
 * Keep the (possibly zoomed) content covering the viewport: the pan offset is
 * clamped so neither edge of the content can move inside the viewport edge.
 */
export function clampPan(
  pan: PanOffset,
  zoom: number,
  viewportSize: { width: number; height: number },
  contentSize: { width: number; height: number }
): PanOffset {
  const scaledW = contentSize.width * zoom;
  const scaledH = contentSize.height * zoom;
  const maxX = Math.max(0, (scaledW - viewportSize.width) / 2);
  const maxY = Math.max(0, (scaledH - viewportSize.height) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, pan.x)),
    y: Math.min(maxY, Math.max(-maxY, pan.y)),
  };
}

/** When the zoom returns to 1 the content fits again — reset pan. */
export function normalizeViewport(
  pan: PanOffset,
  zoom: number,
  viewportSize: { width: number; height: number },
  contentSize: { width: number; height: number }
): { pan: PanOffset; zoom: number } {
  const nextZoom = clampZoom(zoom);
  const nextPan = nextZoom <= 1 ? { x: 0, y: 0 } : clampPan(pan, nextZoom, viewportSize, contentSize);
  return { pan: nextPan, zoom: nextZoom };
}
