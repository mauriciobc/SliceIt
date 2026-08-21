import { useMemo, type ReactElement } from 'react';
import { WedgeGeometry, CanvasGeometry } from '@/lib/geometry';
import { fitText } from '@/lib/textFit';
import { Slice, TypographyConfig } from '@/types/infographic';
import { getIconComponent } from '@/lib/icons';
import { getContrastColor } from '@/lib/palette';
import { useProjectStore } from '@/store/useProjectStore';

interface SliceRendererProps {
  wedge: WedgeGeometry;
  slice: Slice;
  color: string;
  gradientId?: string;
  geometry: CanvasGeometry;
  typography: TypographyConfig;
  showIcon: boolean;
}

interface SliceIconProps {
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface StackItem {
  key: string;
  height: number;
  render: (y: number) => ReactElement;
}

function SliceIcon({ name, x, y, size, color }: SliceIconProps) {
  const Icon = getIconComponent(name);
  if (!Icon) return null;

  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2})`}>
      <Icon size={size} color={color} strokeWidth={Math.max(1.6, size * 0.05)} />
    </g>
  );
}

export function SliceRenderer({
  wedge,
  slice,
  color,
  gradientId,
  geometry,
  typography,
  showIcon,
}: SliceRendererProps) {
  const midAngle = (wedge.startAngle + wedge.endAngle) / 2;
  const midAngleDeg = (midAngle * 180) / Math.PI;
  const isFlipped = midAngleDeg > 90 || midAngleDeg < -90;
  const rotateOn = typography.rotateText ?? false;

  const R = wedge.outerRadius;
  const radialScaleX = R === 0 ? 1 : geometry.outerRadiusX / R;
  const radialScaleY = R === 0 ? 1 : geometry.outerRadiusY / R;
  const sinA = Math.abs(Math.sin(midAngle));
  const cosA = Math.abs(Math.cos(midAngle));
  const boundX = sinA > 1e-6 ? geometry.width / 2 / (geometry.outerRadiusX * sinA) : Infinity;
  const boundY = cosA > 1e-6 ? geometry.height / 2 / (geometry.outerRadiusY * cosA) : Infinity;
  const visibleFactor = Math.min(1, boundX, boundY);
  const visibleRadius = Math.max(wedge.innerRadius + 1, R * visibleFactor - 40);
  const radialSpan = Math.max(1, visibleRadius - wedge.innerRadius);
  const anglePerSlice = wedge.endAngle - wedge.startAngle;

  const textAlign = typography.textAlign ?? 'middle';
  const textAnchor = textAlign === 'start' ? 'start' : textAlign === 'end' ? 'end' : 'middle';

  // When rotated, text lines run tangentially. The clipPath clips at the wedge's
  // straight sides, so the binding constraint is the tangential width at the INNER
  // radius (the narrowest part the block spans). At radius r, the available
  // tangential width = 2 * r * sin(anglePerSlice/2) * radialScaleX.
  const halfSlice = Math.sin(anglePerSlice / 2);
  const tangentialAtInner = 2 * wedge.innerRadius * halfSlice * radialScaleX;
  // lineMaxWidth = tangential width at inner radius, capped by span
  const lineMaxWidthRot = Math.min(radialSpan, tangentialAtInner);
  // Anchor offset: position block so inner edge sits at innerR
  const anchorOffset = (radialSpan - lineMaxWidthRot) / 5;
  const anchorR = wedge.innerRadius + radialSpan * 0.5 + anchorOffset;
  const chordAtAnchor = 2 * anchorR * halfSlice * radialScaleX;

  const anchor = rotateOn
    ? {
        x: anchorR * Math.sin(midAngle) * radialScaleX,
        y: -anchorR * Math.cos(midAngle) * radialScaleY,
      }
    : wedge.content.anchor;

  const halfChord = (rotateOn ? chordAtAnchor : wedge.safeBounds.width) / 2;

  const rotateAngle = isFlipped ? midAngleDeg + 180 : midAngleDeg;
  const rotateTransform = rotateOn
    ? `rotate(${rotateAngle} ${anchor.x} ${anchor.y})`
    : '';

  const lineMaxWidth = rotateOn ? lineMaxWidthRot : wedge.safeBounds.width * 0.9;
  const stackMaxSize = rotateOn ? chordAtAnchor * 0.75 : wedge.safeBounds.height;

  const metricResult = useMemo(
    () =>
      fitText(slice.metric, {
        maxWidth: lineMaxWidth,
        maxHeight: stackMaxSize * 0.32,
        fontFamily: typography.metricFont,
        minFontSize: 16,
        maxFontSize: 64,
      }),
    [slice.metric, lineMaxWidth, stackMaxSize, typography.metricFont]
  );

  const labelResult = useMemo(
    () =>
      fitText(slice.label, {
        maxWidth: lineMaxWidth,
        maxHeight: stackMaxSize * (showIcon ? 0.3 : 0.4),
        fontFamily: typography.labelFont,
        minFontSize: 11,
        maxFontSize: 28,
      }),
    [slice.label, lineMaxWidth, stackMaxSize, typography.labelFont, showIcon]
  );

  const uploadedIcons = useProjectStore((state) => state.uploadedIcons);
  const uploadedIcon = slice.uploadedIconId
    ? uploadedIcons.find((icon) => icon.id === slice.uploadedIconId)
    : undefined;

  const iconName = slice.icon;

  const autoContrast = typography.autoTextContrast ?? false;
  const metricFill = autoContrast ? getContrastColor(color) : typography.metricColor;
  const labelFill = autoContrast ? getContrastColor(color) : typography.labelColor;

  const textX = textAlign === 'start'
    ? anchor.x - halfChord
    : textAlign === 'end'
      ? anchor.x + halfChord
      : anchor.x;

  const items: StackItem[] = [];

  if (showIcon && (uploadedIcon || iconName)) {
    const size = typography.iconSize;
    const chipRadius = size * 0.62;
    const chipDiameter = chipRadius * 2;
    items.push({
      key: 'icon',
      height: chipDiameter,
      render: (y) => (
        <g key="icon">
          <circle
            cx={textX}
            cy={y + chipRadius}
            r={chipRadius}
            fill="#ffffff"
            stroke="rgba(15,23,42,0.06)"
            strokeWidth={1}
          />
          {uploadedIcon ? (
            <image
              href={uploadedIcon.dataUrl}
              x={textX - size / 2}
              y={y + chipRadius - size / 2}
              width={size}
              height={size}
              preserveAspectRatio="xMidYMid meet"
            />
          ) : (
            <SliceIcon
              name={iconName as string}
              x={textX}
              y={y + chipRadius}
              size={size * 0.72}
              color="#0f172a"
            />
          )}
        </g>
      ),
    });
  }

  const metricLineHeight = metricResult.fontSize * 1.1;
  items.push({
    key: 'metric',
    height: metricLineHeight * metricResult.lines.length,
    render: (blockTop) => (
      <text
        key="metric"
        x={textX}
        y={blockTop + metricLineHeight / 2}
        textAnchor={textAnchor}
        dominantBaseline="middle"
        fill={metricFill}
        style={{
          fontFamily: typography.metricFont,
          fontSize: metricResult.fontSize,
          fontWeight: typography.metricFontWeight ?? 700,
          textTransform: 'uppercase',
        }}
      >
        {metricResult.lines.map((line, i) => (
          <tspan key={i} x={textX} dy={i === 0 ? 0 : `${metricLineHeight}px`}>
            {line}
          </tspan>
        ))}
      </text>
    ),
  });

  const labelLineHeight = labelResult.fontSize * 1.25;
  items.push({
    key: 'label',
    height: labelLineHeight * labelResult.lines.length,
    render: (blockTop) => (
      <text
        key="label"
        x={textX}
        y={blockTop + labelLineHeight / 2}
        textAnchor={textAnchor}
        dominantBaseline="middle"
        fill={labelFill}
        style={{
          fontFamily: typography.labelFont,
          fontSize: labelResult.fontSize,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}
      >
        {labelResult.lines.map((line, i) => (
          <tspan key={i} x={textX} dy={i === 0 ? 0 : `${labelLineHeight}px`}>
            {line}
          </tspan>
        ))}
      </text>
    ),
  });

  const gap = stackMaxSize * 0.04;
  const totalHeight =
    items.reduce((sum, item) => sum + item.height, 0) + gap * (items.length - 1);
  let cursorY = anchor.y - totalHeight / 2;
  const orderedItems = isFlipped ? [...items].reverse() : items;
  const renderedItems: ReactElement[] = [];
  for (const item of orderedItems) {
    renderedItems.push(item.render(cursorY));
    cursorY += item.height + gap;
  }

  return (
    <g>
      <path d={wedge.path} fill={gradientId ? `url(#${gradientId})` : color} stroke="none" />

      <clipPath id={`wedge-clip-${wedge.id}`}>
        <path d={wedge.clipPath} />
      </clipPath>

      <g clipPath={`url(#wedge-clip-${wedge.id})`}>
        <g transform={rotateTransform}>
          {renderedItems}
        </g>
      </g>
    </g>
  );
}
