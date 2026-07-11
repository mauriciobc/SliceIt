import { useMemo, useRef } from 'react';
import { hsl } from 'd3-color';
import { useProjectStore } from '@/store/useProjectStore';
import { computeCanvasGeometry } from '@/lib/geometry';
import { getAllSliceColors, deriveCenterColor } from '@/lib/palette';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { useGoogleFont } from '@/hooks/useGoogleFont';
import { CenterWheel } from './CenterWheel';
import { SliceRenderer } from './SliceRenderer';
import { cn } from '@/lib/utils';

export function RadialCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvas = useProjectStore((state) => state.canvas);
  const slices = useProjectStore((state) => state.slices);
  const centerConfig = useProjectStore((state) => state.center);
  const typography = useProjectStore((state) => state.typography);
  const palette = useProjectStore((state) => state.palette);

  const geometry = useMemo(() => computeCanvasGeometry(canvas, slices, typography), [canvas, slices, typography]);
  const sliceColors = useMemo(() => getAllSliceColors(palette, slices), [palette, slices]);
  const centerColor = useMemo(
    () => centerConfig.centerColorOverride ?? deriveCenterColor(sliceColors),
    [centerConfig.centerColorOverride, sliceColors]
  );

  const showDividers = canvas.showDividers ?? false;
  const dividerWidth = canvas.dividerWidth ?? 2;
  const sliceStyle = useProjectStore((state) => state.sliceStyle);

  useGoogleFont([
    centerConfig.titleFont,
    centerConfig.subtitleFont,
    centerConfig.captionFont,
    typography.metricFont,
    typography.labelFont,
  ]);

  const { width: containerWidth, height: containerHeight } = useResizeObserver(containerRef);
  const scale = useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0) return 1;
    const scaleX = containerWidth / geometry.width;
    const scaleY = containerHeight / geometry.height;
    return Math.min(scaleX, scaleY) * 0.95;
  }, [containerWidth, containerHeight, geometry.width, geometry.height]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex h-full w-full items-center justify-center',
        'overflow-hidden rounded-lg bg-background shadow-sm'
      )}
      aria-label="Radial infographic preview"
    >
      <svg
        id="radial-canvas"
        width={geometry.width * scale}
        height={geometry.height * scale}
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        className="max-h-full max-w-full"
      >
        <defs>
          {sliceStyle.fillMode === 'radial' && geometry.wedges.map((wedge, index) => {
            const color = hsl(sliceColors[index]);
            const lightColor = hsl(
              color.h,
              Math.max(0, color.s - sliceStyle.gradientIntensity * 0.5),
              Math.min(1, color.l + sliceStyle.gradientIntensity * 0.5)
            );
            
            const midAngle = (wedge.startAngle + wedge.endAngle) / 2;
            const cos = Math.cos(midAngle);
            const sin = Math.sin(midAngle);
            
            const x1 = geometry.innerRadius * sin;
            const y1 = -geometry.innerRadius * cos;
            
            const x2 = geometry.outerRadiusX * sin;
            const y2 = -geometry.outerRadiusY * cos;

            return (
              <linearGradient
                key={`grad-${wedge.id}`}
                id={`grad-${wedge.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={lightColor.formatHex()} />
                <stop offset="100%" stopColor={color.formatHex()} />
              </linearGradient>
            );
          })}
        </defs>

        <rect
          width={geometry.width}
          height={geometry.height}
          fill={canvas.backgroundColor}
        />

        <g transform={`translate(${geometry.centerX}, ${geometry.centerY})`}>
          <g>
            {geometry.wedges.map((wedge, index) => (
              <SliceRenderer
                key={wedge.id}
                wedge={wedge}
                slice={slices[index]}
                color={sliceColors[index]}
                gradientId={sliceStyle.fillMode === 'radial' ? `grad-${wedge.id}` : undefined}
                geometry={geometry}
                typography={typography}
                showIcon={typography.showIcons}
              />
            ))}
          </g>

          {showDividers && geometry.wedges.map((wedge) => {
            const angle = wedge.startAngle;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            const innerPoint = {
              x: geometry.innerRadius * sin,
              y: -geometry.innerRadius * cos
            };
            const outerPoint = {
              x: geometry.outerRadiusX * sin,
              y: -geometry.outerRadiusY * cos
            };
            return (
              <line
                key={`divider-${wedge.id}`}
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke={canvas.backgroundColor}
                strokeWidth={dividerWidth}
              />
            );
          })}

          <CenterWheel
            geometry={geometry}
            centerConfig={centerConfig}
            centerColor={centerColor}
          />
        </g>
      </svg>
    </div>
  );
}
