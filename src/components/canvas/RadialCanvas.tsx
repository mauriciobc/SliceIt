import { useMemo, useRef } from 'react';
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

  const geometry = useMemo(() => computeCanvasGeometry(canvas, slices), [canvas, slices]);
  const sliceColors = useMemo(() => getAllSliceColors(palette, slices), [palette, slices]);
  const centerColor = useMemo(
    () => centerConfig.centerColorOverride ?? deriveCenterColor(sliceColors),
    [centerConfig.centerColorOverride, sliceColors]
  );

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
                geometry={geometry}
                typography={typography}
                showIcon={typography.showIcons}
              />
            ))}
          </g>

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
