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
  typography,
  showIcon,
}: SliceRendererProps) {
  const metricResult = useMemo(
    () =>
      fitText(slice.metric, {
        maxWidth: wedge.safeBounds.width * 0.9,
        maxHeight: wedge.safeBounds.height * 0.32,
        fontFamily: typography.metricFont,
        minFontSize: 16,
        maxFontSize: 64,
      }),
    [slice.metric, wedge.safeBounds, typography.metricFont]
  );

  const labelResult = useMemo(
    () =>
      fitText(slice.label, {
        maxWidth: wedge.safeBounds.width * 0.9,
        maxHeight: wedge.safeBounds.height * (showIcon ? 0.3 : 0.4),
        fontFamily: typography.labelFont,
        minFontSize: 11,
        maxFontSize: 28,
      }),
    [slice.label, wedge.safeBounds, typography.labelFont, showIcon]
  );

  const uploadedIcons = useProjectStore((state) => state.uploadedIcons);
  const uploadedIcon = slice.uploadedIconId
    ? uploadedIcons.find((icon) => icon.id === slice.uploadedIconId)
    : undefined;

  const iconName = slice.icon;

  const autoContrast = typography.autoTextContrast ?? false;
  const metricFill = autoContrast ? getContrastColor(color) : typography.metricColor;
  const labelFill = autoContrast ? getContrastColor(color) : typography.labelColor;

  const textAlign = typography.textAlign ?? 'middle';
  const textAnchor = textAlign === 'start' ? 'start' : textAlign === 'end' ? 'end' : 'middle';
  const anchorX = wedge.content.anchor.x;
  const halfChord = wedge.safeBounds.width / 2;
  const textX = textAlign === 'start'
    ? anchorX - halfChord
    : textAlign === 'end'
      ? anchorX + halfChord
      : anchorX;

  const midAngle = (wedge.startAngle + wedge.endAngle) / 2;
  const midAngleDeg = (midAngle * 180) / Math.PI;
  const isFlipped = midAngleDeg > 90 || midAngleDeg < -90;

  const rotateTransform = typography.rotateText
    ? `rotate(${isFlipped ? midAngleDeg + 180 : midAngleDeg})`
    : '';

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

  const gap = wedge.safeBounds.height * 0.04;
  const totalHeight =
    items.reduce((sum, item) => sum + item.height, 0) + gap * (items.length - 1);
  let cursorY = wedge.content.anchor.y - totalHeight / 2;
  const renderedItems: ReactElement[] = [];
  for (const item of items) {
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
        <g transform={rotateTransform} style={{ transformOrigin: '0px 0px' }}>
          {renderedItems}
        </g>
      </g>
    </g>
  );
}
