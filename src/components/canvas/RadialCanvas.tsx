import { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clampPan, clampZoom, normalizeViewport, stepZoom, WHEEL_ZOOM_FACTOR, type PanOffset } from '@/lib/viewport';
import { hsl } from 'd3-color';
import { useProjectStore } from '@/store/useProjectStore';
import { computeCanvasGeometry } from '@/lib/geometry';
import { getAllSliceColors, deriveCenterColor, getContrastColor } from '@/lib/palette';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { useGoogleFont } from '@/hooks/useGoogleFont';
import { CenterWheel } from './CenterWheel';
import { SliceRenderer } from './SliceRenderer';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';

export function RadialCanvas() {
  const { t } = useI18n();
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

  const showDividers = canvas.showDividers ?? true;
  const dividerWidth = canvas.dividerWidth ?? 5;
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

  // ---- Pan / zoom (transforms apply to the WRAPPER, never the SVG, so export
  // capture and the geometry gauntlet stay unaffected at zoom 1).
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PanOffset>({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; basePan: PanOffset } | null>(null);
  const containerSize = { width: containerWidth, height: containerHeight };
  const contentSize = { width: geometry.width * scale, height: geometry.height * scale };

  // Reset the viewport when the project geometry changes (aspect ratio,
  // slices...). Adjusting state during render per the React docs ("derived
  // state from props") keeps it immediate and avoids effect ordering issues.
  const geometryKey = geometry.width + 'x' + geometry.height;
  const [lastGeometryKey, setLastGeometryKey] = useState(geometryKey);
  if (lastGeometryKey !== geometryKey) {
    setLastGeometryKey(geometryKey);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  // Non-passive wheel listener so preventDefault works reliably.
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((current) => {
          const next = clampZoom(current * (e.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR));
          const normalized = normalizeViewport(pan, next, containerSize, contentSize);
          setPan(normalized.pan);
          return normalized.zoom;
        });
        return;
      }
      if (zoom > 1) {
        e.preventDefault();
        setPan((p) => clampPan({ x: p.x, y: p.y - e.deltaY }, zoom, containerSize, contentSize));
      }
    };
    wrapper.addEventListener('wheel', onWheel, { passive: false });
    return () => wrapper.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, pan, containerWidth, containerHeight, geometry.width, geometry.height, scale]);

  const zoomBy = (direction: 1 | -1) => {
    const next = stepZoom(zoom, direction);
    const normalized = normalizeViewport(pan, next, containerSize, contentSize);
    setZoom(normalized.zoom);
    setPan(normalized.pan);
  };

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      aria-label="Radial infographic preview"
      className={cn(
        'absolute inset-0 m-3 flex items-center justify-center overflow-hidden rounded-lg bg-background shadow-sm sm:m-6'
      )}
    >
      <div
        ref={wrapperRef}
        className="flex h-full w-full select-none items-center justify-center"
        style={{
          transform: zoom === 1 && pan.x === 0 && pan.y === 0 ? undefined : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '50% 50%',
          touchAction: zoom > 1 ? 'none' : undefined,
          cursor: zoom > 1 ? 'grab' : undefined,
        }}
        onPointerDown={(e) => {
          if (zoom <= 1) return;
          e.preventDefault();
          dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, basePan: pan };
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== e.pointerId) return;
          setPan(
            clampPan(
              { x: drag.basePan.x + (e.clientX - drag.startX), y: drag.basePan.y + (e.clientY - drag.startY) },
              zoom,
              containerSize,
              containerSize
            )
          );
        }}
        onPointerUp={(e) => {
          if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
        }}
        onPointerCancel={(e) => {
          if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
        }}
      >
      <svg
        id="radial-canvas"
        width={geometry.width * scale}
        height={geometry.height * scale}
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={t('canvas.ariaLabel')}
        className="max-h-full max-w-full"
      >
        <title>{t('canvas.ariaLabel')}</title>
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
            brandName={canvas.brandName}
            showBrandAttribution={canvas.showBrandAttribution}
          />
        </g>

        {canvas.sourceNote ? (
          <g>
            <rect
              x={14}
              y={geometry.height - 28}
              width={Math.max(120, canvas.sourceNote.length * 6.2 + 16)}
              height={18}
              rx={9}
              fill={canvas.backgroundColor}
              opacity={0.88}
            />
            <text
              x={22}
              y={geometry.height - 16}
              fill={getContrastColor(canvas.backgroundColor)}
              opacity={0.72}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: Math.max(10, geometry.height * 0.011),
                fontWeight: 500,
                letterSpacing: '0.01em',
              }}
            >
              {canvas.sourceNote}
            </text>
          </g>
        ) : null}
      </svg>
      </div>

      <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-lg border bg-background/95 p-1 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => zoomBy(-1)}
          disabled={zoom <= 1}
          aria-label={t('canvas.zoomOut')}
          title={t('canvas.zoomOut')}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-10 text-center text-xs tabular-nums" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => zoomBy(1)}
          disabled={zoom >= 4}
          aria-label={t('canvas.zoomIn')}
          title={t('canvas.zoomIn')}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={resetViewport}
          disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
          aria-label={t('canvas.zoomReset')}
          title={t('canvas.zoomReset')}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}