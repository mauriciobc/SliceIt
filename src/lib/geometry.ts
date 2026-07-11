import { CanvasConfig, Dimensions, LayoutMode, Slice, TypographyConfig } from '@/types/infographic';

export interface Point {
  x: number;
  y: number;
}

export interface WedgeGeometry {
  id: string;
  index: number;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  centroid: Point;
  iconInnerPoint: Point;
  iconOuterPoint: Point;
  path: string;
  clipPath: string;
  safeBounds: { x: number; y: number; width: number; height: number };
}

export type IconPlacement = 'inner' | 'outer';

export function getIconPosition(
  wedge: WedgeGeometry,
  placement: IconPlacement,
  offset: number
): Point {
  const t = placement === 'inner'
    ? 0.12 + offset * 0.13
    : 0.62 + offset * 0.33;
  return {
    x: wedge.iconInnerPoint.x + t * (wedge.iconOuterPoint.x - wedge.iconInnerPoint.x),
    y: wedge.iconInnerPoint.y + t * (wedge.iconOuterPoint.y - wedge.iconInnerPoint.y),
  };
}

export interface CanvasGeometry {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadiusX: number;
  outerRadiusY: number;
  layout: LayoutMode;
  wedges: WedgeGeometry[];
}

export function getLayoutMode(dimensions: Dimensions): LayoutMode {
  const ratio = dimensions.width / dimensions.height;
  if (Math.abs(ratio - 1) < 0.05) return 'square';
  return ratio > 1 ? 'landscape' : 'portrait';
}

function ringPoint(a: number, rx: number, ry: number): Point {
  return { x: rx * Math.sin(a), y: -ry * Math.cos(a) };
}

export function buildWedgePath(
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadiusX: number,
  outerRadiusY: number,
  inflate = 0
): string {
  const rOutX = outerRadiusX + inflate;
  const rOutY = outerRadiusY + inflate;

  const innerStart = ringPoint(startAngle, innerRadius, innerRadius);
  const outerStart = ringPoint(startAngle, rOutX, rOutY);
  const outerEnd = ringPoint(endAngle, rOutX, rOutY);
  const innerEnd = ringPoint(endAngle, innerRadius, innerRadius);

  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${rOutX} ${rOutY} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

interface IconRing {
  inflate: number;
  innerR: number;
  outerRX: number;
  outerRY: number;
}

function computeIconRing(
  innerRadius: number,
  outerRadiusX: number,
  outerRadiusY: number,
  width: number,
  sliceMargin: number,
  iconSize: number
): IconRing {
  const inflate = Math.max(1, sliceMargin + iconSize / 2);
  const innerR = innerRadius + inflate;
  const outerRX = Math.max(innerR, width / 2 - inflate);
  const outerRY = Math.max(innerR, outerRX * (outerRadiusY / outerRadiusX));
  return { inflate, innerR, outerRX, outerRY };
}

export function computeCanvasGeometry(
  canvas: CanvasConfig,
  slices: Slice[],
  typography?: TypographyConfig
): CanvasGeometry {
  const { width, height } = canvas.dimensions;
  const segmentExtension = canvas.segmentExtension ?? 1.3;
  const textPadding = canvas.textPadding ?? 0.4;
  const layout = getLayoutMode(canvas.dimensions);
  const centerX = width / 2;
  const centerY = height / 2;

  const innerRadius = Math.min(width, height) * (canvas.innerRadiusRatio ?? 0.18);

  const baseRadiusX = (width / 2) * segmentExtension;
  const baseRadiusY = (height / 2) * segmentExtension;
  const squareRadius = Math.min(baseRadiusX, baseRadiusY);

  const outerRadiusX = layout === 'square' ? squareRadius : baseRadiusX;
  const outerRadiusY = layout === 'square' ? squareRadius : baseRadiusY;

  const R = Math.max(outerRadiusX, outerRadiusY);
  const scaleX = R === 0 ? 1 : outerRadiusX / R;
  const scaleY = R === 0 ? 1 : outerRadiusY / R;

  const sliceCount = slices.length;
  const anglePerSlice = (2 * Math.PI) / sliceCount;

  const wedges: WedgeGeometry[] = slices.map((slice, index) => {
    const startAngle = index * anglePerSlice - Math.PI / 2;
    const endAngle = (index + 1) * anglePerSlice - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;

    const path = buildWedgePath(
      startAngle,
      endAngle,
      innerRadius,
      outerRadiusX,
      outerRadiusY
    );

    // Compute icon ring geometry once, reuse for clipPath and icon positioning
    const ring = computeIconRing(
      innerRadius,
      outerRadiusX,
      outerRadiusY,
      width,
      slice.iconMargin ?? typography?.iconMargin ?? 8,
      typography?.iconSize ?? 48
    );

    const clipPath = buildWedgePath(
      startAngle,
      endAngle,
      innerRadius,
      outerRadiusX,
      outerRadiusY,
      ring.inflate
    );

    const midRadius = innerRadius + (R - innerRadius) * textPadding;
    const canonical = ringPoint(midAngle, midRadius, midRadius);
    const centroid: Point = {
      x: canonical.x * scaleX,
      y: canonical.y * scaleY,
    };

    const chordLength = 2 * midRadius * Math.sin(anglePerSlice / 2);
    const safeWidth0 = chordLength * 0.7;
    const safeHeight0 = (R - innerRadius) * 0.45;
    const safeBounds = {
      x: (canonical.x - safeWidth0 / 2) * scaleX,
      y: (canonical.y - safeHeight0 / 2) * scaleY,
      width: safeWidth0 * scaleX,
      height: safeHeight0 * scaleY,
    };

    const iconInnerPoint = ringPoint(midAngle, ring.innerR, ring.innerR);
    const iconOuterPoint = ringPoint(midAngle, ring.outerRX, ring.outerRY);

    return {
      id: slice.id,
      index,
      startAngle,
      endAngle,
      innerRadius,
      outerRadius: R,
      centroid,
      iconInnerPoint,
      iconOuterPoint,
      path,
      clipPath,
      safeBounds,
    };
  });

  return {
    width,
    height,
    centerX,
    centerY,
    innerRadius,
    outerRadiusX,
    outerRadiusY,
    layout,
    wedges,
  };
}
