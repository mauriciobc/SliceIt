import { CanvasGeometry } from '@/lib/geometry';
import { CenterConfig } from '@/types/infographic';

interface CenterWheelProps {
  geometry: CanvasGeometry;
  centerConfig: CenterConfig;
  centerColor: string;
}

export function CenterWheel({ geometry, centerConfig, centerColor }: CenterWheelProps) {
  const { innerRadius } = geometry;
  const { title, subtitle, footerCaption, logos, logoPlacement } = centerConfig;

  const lineHeight = innerRadius * 0.38;
  const titleSize = innerRadius * 0.55;
  const subtitleSize = innerRadius * 0.55;
  const captionSize = innerRadius * 0.22;

  const logoSize = innerRadius * 0.35;
  const logoY =
    logoPlacement === 'top'
      ? -innerRadius * 0.55
      : logoPlacement === 'bottom'
        ? innerRadius * 0.65
        : innerRadius * 0.65;

  return (
    <g>
      <circle r={innerRadius} fill={centerColor} stroke="none" />

      {logos.length > 0 && (
        <g transform={`translate(0, ${logoY})`}>
          {logos.map((logo, index) => {
            const offset = (index - (logos.length - 1) / 2) * (logoSize + 8);
            return (
              <image
                key={logo.id}
                href={logo.dataUrl}
                x={offset - logoSize / 2}
                y={-logoSize / 2}
                width={logoSize}
                height={logoSize}
                preserveAspectRatio="xMidYMid meet"
              />
            );
          })}
        </g>
      )}

      <text
        y={-lineHeight}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={centerConfig.titleColor}
        style={{
          fontFamily: centerConfig.titleFont,
          fontSize: titleSize,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </text>

      <text
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={centerConfig.subtitleColor}
        style={{
          fontFamily: centerConfig.subtitleFont,
          fontSize: subtitleSize,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        {subtitle}
      </text>

      <text
        y={lineHeight}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={centerConfig.captionColor}
        style={{
          fontFamily: centerConfig.captionFont,
          fontSize: captionSize,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {footerCaption}
      </text>
    </g>
  );
}
