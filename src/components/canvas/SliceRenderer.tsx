import { useMemo } from 'react';
import { WedgeGeometry, CanvasGeometry } from '@/lib/geometry';
import { fitText } from '@/lib/textFit';
import { Slice, TypographyConfig } from '@/types/infographic';
import { iconComponents } from '@/lib/icons';
import { useProjectStore } from '@/store/useProjectStore';
import { LucideProps } from 'lucide-react';

interface SliceRendererProps {
  wedge: WedgeGeometry;
  slice: Slice;
  color: string;
  geometry: CanvasGeometry;
  typography: TypographyConfig;
  showIcon: boolean;
}

interface SliceIconProps extends LucideProps {
  name: string;
  x: number;
  y: number;
}

function SliceIcon({ name, x, y, size, color }: SliceIconProps) {
  const Icon = iconComponents[name];
  if (!Icon) return null;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <Icon size={size} color={color} strokeWidth={2} />
    </g>
  );
}

export function SliceRenderer({
  wedge,
  slice,
  color,
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

  const metricY = wedge.safeBounds.y + wedge.safeBounds.height * 0.25;
  const labelY = metricY + wedge.safeBounds.height * typography.metricLabelGap;
  const iconY = wedge.safeBounds.y + wedge.safeBounds.height * 0.82;

  const uploadedIcons = useProjectStore((state) => state.uploadedIcons);
  const uploadedIcon = slice.uploadedIconId
    ? uploadedIcons.find((icon) => icon.id === slice.uploadedIconId)
    : undefined;

  const iconName = slice.icon;

  return (
    <g>
      <path d={wedge.path} fill={color} stroke="none" />

      <clipPath id={`wedge-clip-${wedge.id}`}>
        <path d={wedge.clipPath} />
      </clipPath>

      <g clipPath={`url(#wedge-clip-${wedge.id})`}>
        <text
          x={wedge.centroid.x}
          y={metricY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={typography.metricColor}
          style={{
            fontFamily: typography.metricFont,
            fontSize: metricResult.fontSize,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {metricResult.lines.map((line, i) => (
            <tspan key={i} x={wedge.centroid.x} dy={i === 0 ? 0 : '1.1em'}>
              {line}
            </tspan>
          ))}
        </text>

        <text
          x={wedge.centroid.x}
          y={labelY}
          textAnchor="middle"
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
            <tspan key={i} x={wedge.centroid.x} dy={i === 0 ? 0 : '1.1em'}>
              {line}
            </tspan>
          ))}
        </text>

        {showIcon && uploadedIcon && (
          <image
            href={uploadedIcon.dataUrl}
            x={wedge.centroid.x - typography.iconSize / 2}
            y={iconY - typography.iconSize / 2}
            width={typography.iconSize}
            height={typography.iconSize}
            preserveAspectRatio="xMidYMid meet"
          />
        )}
        {showIcon && !uploadedIcon && iconName && (
          <SliceIcon name={iconName} x={wedge.centroid.x} y={iconY} size={typography.iconSize} color={typography.labelColor} />
        )}
      </g>
    </g>
  );
}
