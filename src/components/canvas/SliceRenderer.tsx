import { useMemo } from 'react';
import { WedgeGeometry, CanvasGeometry } from '@/lib/geometry';
import { fitText } from '@/lib/textFit';
import { Slice, TypographyConfig } from '@/types/infographic';
import { iconComponents } from '@/lib/icons';
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

function SliceIcon({ name, x, y, size, color }: SliceIconProps) {
  const Icon = iconComponents[name];
  if (!Icon) return null;

  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2})`}>
      <Icon size={size} color={color} strokeWidth={2} />
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
        maxHeight: wedge.safeBounds.height * 0.4,
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
        maxHeight: wedge.safeBounds.height * (showIcon ? 0.35 : 0.45),
        fontFamily: typography.labelFont,
        minFontSize: 12,
        maxFontSize: 28,
      }),
    [slice.label, wedge.safeBounds, typography.labelFont, showIcon]
  );

  const effectiveIconPlacement = slice.iconVerticalPosition !== undefined
    ? (slice.iconVerticalPosition < 0.5 ? 'inner' : 'outer')
    : (typography.iconPlacement ?? 'outer');

  const metricY = wedge.safeBounds.y + wedge.safeBounds.height * (0.5 - typography.metricLabelGap / 2);
  const labelY = metricY + wedge.safeBounds.height * typography.metricLabelGap;

  const offset = slice.iconVerticalPosition ?? typography.iconVerticalPosition ?? 0.5;
  const t = effectiveIconPlacement === 'inner'
    ? 0.12 + offset * 0.13
    : 0.62 + offset * 0.33;
  const iconPos = {
    x: wedge.iconInnerPoint.x + t * (wedge.iconOuterPoint.x - wedge.iconInnerPoint.x),
    y: wedge.iconInnerPoint.y + t * (wedge.iconOuterPoint.y - wedge.iconInnerPoint.y),
  };

  const uploadedIcons = useProjectStore((state) => state.uploadedIcons);
  const uploadedIcon = slice.uploadedIconId
    ? uploadedIcons.find((icon) => icon.id === slice.uploadedIconId)
    : undefined;

  const iconName = slice.icon;

  const textAlign = typography.textAlign ?? 'middle';
  const textAnchor = textAlign === 'start' ? 'start' : textAlign === 'end' ? 'end' : 'middle';
  const textX = textAlign === 'start'
    ? wedge.safeBounds.x
    : textAlign === 'end'
      ? wedge.safeBounds.x + wedge.safeBounds.width
      : wedge.centroid.x;

  const midAngle = (wedge.startAngle + wedge.endAngle) / 2;
  const midAngleDeg = (midAngle * 180) / Math.PI;
  const isFlipped = midAngleDeg > 90 || midAngleDeg < -90;

  const rotateTransform = typography.rotateText
    ? `rotate(${isFlipped ? midAngleDeg + 180 : midAngleDeg})`
    : '';

  return (
    <g>
      <path d={wedge.path} fill={gradientId ? `url(#${gradientId})` : color} stroke="none" />

      <clipPath id={`wedge-clip-${wedge.id}`}>
        <path d={wedge.clipPath} />
      </clipPath>

      <g clipPath={`url(#wedge-clip-${wedge.id})`}>
        <g transform={rotateTransform} style={{ transformOrigin: `${wedge.centroid.x}px ${wedge.centroid.y}px` }}>
          <text
            x={textX}
            y={metricY}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fill={typography.metricColor}
            style={{
              fontFamily: typography.metricFont,
              fontSize: metricResult.fontSize,
              fontWeight: typography.metricFontWeight ?? 700,
              textTransform: 'uppercase',
            }}
          >
            {metricResult.lines.map((line, i) => (
              <tspan key={i} x={textX} dy={i === 0 ? 0 : '1.1em'}>
                {line}
              </tspan>
            ))}
          </text>

          <text
            x={textX}
            y={labelY}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fill={typography.labelColor}
            style={{
              fontFamily: typography.labelFont,
              fontSize: labelResult.fontSize,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {labelResult.lines.map((line, i) => (
              <tspan key={i} x={textX} dy={i === 0 ? 0 : '1.1em'}>
                {line}
              </tspan>
            ))}
          </text>
        </g>

        {showIcon && uploadedIcon && (
          <image
            href={uploadedIcon.dataUrl}
            x={iconPos.x - typography.iconSize / 2}
            y={iconPos.y - typography.iconSize / 2}
            width={typography.iconSize}
            height={typography.iconSize}
            preserveAspectRatio="xMidYMid meet"
          />
        )}
        {showIcon && !uploadedIcon && iconName && (
          <SliceIcon name={iconName} x={iconPos.x} y={iconPos.y} size={typography.iconSize} color={typography.labelColor} />
        )}
      </g>
    </g>
  );
}
