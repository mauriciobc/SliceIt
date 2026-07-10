import { arc } from 'd3-shape';
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

export function computeCanvasGeometry(
  canvas: CanvasConfig,
  slices: Slice[]
): CanvasGeometry {
  const { width, height } = canvas.dimensions;
  const layout = getLayoutMode(canvas.dimensions);
  const centerX = width / 2;
  const centerY = height / 2;

  const padding = Math.min(width, height) * 0.04;
  const innerRadius = Math.min(width, height) * 0.18;

  let outerRadiusX: number;
  let outerRadiusY: number;

  if (layout === 'square') {
    const available = Math.min(width, height) / 2 - padding;
    outerRadiusX = available;
    outerRadiusY = available;
  } else if (layout === 'landscape') {
    outerRadiusY = height / 2 - padding;
    outerRadiusX = width / 2 - padding * 2;
  } else {
    outerRadiusX = width / 2 - padding;
    outerRadiusY = height / 2 - padding * 2;
  }

  const sliceCount = slices.length;
  const anglePerSlice = (2 * Math.PI) / sliceCount;

  const wedgeArc = arc<unknown, unknown>()
    .innerRadius(innerRadius)
    .outerRadius(Math.max(outerRadiusX, outerRadiusY))
    .startAngle((_, i) => i * anglePerSlice - Math.PI / 2)
    .endAngle((_, i) => (i + 1) * anglePerSlice - Math.PI / 2);

  const wedgeArcClip = arc<unknown, unknown>()
    .innerRadius(innerRadius)
    .outerRadius(Math.max(outerRadiusX, outerRadiusY) + 1)
    .startAngle((_, i) => i * anglePerSlice - Math.PI / 2)
    .endAngle((_, i) => (i + 1) * anglePerSlice - Math.PI / 2);

  const wedges: WedgeGeometry[] = slices.map((slice, index) => {
    const startAngle = index * anglePerSlice - Math.PI / 2;
    const endAngle = (index + 1) * anglePerSlice - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;

    const path = wedgeArc(null as unknown as unknown, index) ?? '';
    const clipPath = wedgeArcClip(null as unknown as unknown, index) ?? '';

    const centroidRadius = innerRadius + (Math.max(outerRadiusX, outerRadiusY) - innerRadius) * 0.55;
    // d3-shape.arc uses 0 at 12 o'clock with clockwise-positive angles, so convert
    // the arc's midAngle to centered SVG coordinates.
    const centroid: Point = {
      x: Math.sin(midAngle) * centroidRadius,
      y: -Math.cos(midAngle) * centroidRadius,
    };

    // Compute a safe bounding box for text inside the wedge, also in centered space
    const safeWidth = Math.min(outerRadiusX, outerRadiusY) * 0.55;
    const safeHeight = Math.min(outerRadiusX, outerRadiusY) * 0.35;
    const safeBounds = {
      x: centroid.x - safeWidth / 2,
      y: centroid.y - safeHeight / 2,
      width: safeWidth,
      height: safeHeight,
    };

    return {
      id: slice.id,
      index,
      startAngle,
      endAngle,
      innerRadius,
      outerRadius: Math.max(outerRadiusX, outerRadiusY),
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
