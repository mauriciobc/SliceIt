import { CanvasConfig, Dimensions, LayoutMode, Slice } from '@/types/infographic';

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
  path: string;
  clipPath: string;
  safeBounds: { x: number; y: number; width: number; height: number };
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

export function computeCanvasGeometry(
  canvas: CanvasConfig,
  slices: Slice[]
): CanvasGeometry {
  const { width, height } = canvas.dimensions;
  const segmentExtension = canvas.segmentExtension ?? 1.3;
  const textPadding = canvas.textPadding ?? 0.4;
  const layout = getLayoutMode(canvas.dimensions);
  const centerX = width / 2;
  const centerY = height / 2;

  const innerRadius = Math.min(width, height) * 0.18;

  let outerRadiusX: number;
  let outerRadiusY: number;

  if (layout === 'square') {
    const available = Math.min(width, height) / 2;
    outerRadiusX = available * segmentExtension;
    outerRadiusY = available * segmentExtension;
  } else if (layout === 'landscape') {
    outerRadiusY = height / 2 * segmentExtension;
    outerRadiusX = width / 2 * segmentExtension;
  } else {
    outerRadiusX = width / 2 * segmentExtension;
    outerRadiusY = height / 2 * segmentExtension;
  }

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
    const clipPath = buildWedgePath(
      startAngle,
      endAngle,
      innerRadius,
      outerRadiusX,
      outerRadiusY,
      1
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

    return {
      id: slice.id,
      index,
      startAngle,
      endAngle,
      innerRadius,
      outerRadius: R,
      centroid,
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
