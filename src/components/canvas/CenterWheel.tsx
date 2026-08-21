import { useMemo } from 'react';
import { CanvasGeometry } from '@/lib/geometry';
import { CenterConfig } from '@/types/infographic';
import { getContrastColor } from '@/lib/palette';
import { getIconComponent } from '@/lib/icons';

interface CenterWheelProps {
  geometry: CanvasGeometry;
  centerConfig: CenterConfig;
  centerColor: string;
  brandName?: string;
  showBrandAttribution?: boolean;
}

interface CenterLine {
  text: string;
  font: string;
  baseSize: number;
  color: string;
  weight: number;
  letterSpacing?: string;
}

function measureText(text: string, font: string): number {
  if (typeof document === 'undefined') return text.length * 10;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return text.length * 10;

  ctx.font = font;
  return ctx.measureText(text).width;
}

function buildLines(centerConfig: CenterConfig, hubTextColor: string, mutedHubTextColor: string): CenterLine[] {
  const lines: CenterLine[] = [];
  if (centerConfig.title) {
    lines.push({
      text: centerConfig.title,
      font: centerConfig.titleFont,
      baseSize: 0.38,
      color: centerConfig.deriveTextColors ? hubTextColor : centerConfig.titleColor,
      weight: 700,
    });
  }
  if (centerConfig.subtitle) {
    lines.push({
      text: centerConfig.subtitle,
      font: centerConfig.subtitleFont,
      baseSize: 0.38,
      color: centerConfig.deriveTextColors ? hubTextColor : centerConfig.subtitleColor,
      weight: 700,
    });
  }
  if (centerConfig.footerCaption) {
    lines.push({
      text: centerConfig.footerCaption,
      font: centerConfig.captionFont,
      baseSize: 0.16,
      color: centerConfig.deriveTextColors ? mutedHubTextColor : centerConfig.captionColor,
      weight: 500,
      letterSpacing: '0.08em',
    });
  }
  return lines;
}

function HubTicks({ radius }: { radius: number }) {
  const ticks = 60;
  return (
    <g opacity={0.28}>
      {Array.from({ length: ticks }).map((_, i) => {
        const angle = (i / ticks) * Math.PI * 2;
        const isMajor = i % 15 === 0;
        const r1 = radius - (isMajor ? 11 : 5);
        const r2 = radius - 1.2;
        const x1 = r1 * Math.sin(angle);
        const y1 = -r1 * Math.cos(angle);
        const x2 = r2 * Math.sin(angle);
        const y2 = -r2 * Math.cos(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={isMajor ? 1.4 : 0.9}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function CenterEmblem({ name, size, color }: { name: string; size: number; color: string }) {
  const Icon = getIconComponent(name);
  if (!Icon) return null;
  return (
    <g transform={`translate(${-size / 2}, ${-size / 2})`}>
      <Icon size={size} color={color} strokeWidth={1.6} />
    </g>
  );
}

export function CenterWheel({ geometry, centerConfig, centerColor, brandName, showBrandAttribution = true }: CenterWheelProps) {
  const { innerRadius } = geometry;
  const logos = centerConfig.logos;
  const logoPlacement = centerConfig.logoPlacement;
  const hasLogos = logos.length > 0 && logoPlacement !== 'center';
  const hubTextColor = getContrastColor(centerColor);
  const mutedHubTextColor = hubTextColor === '#ffffff' ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.62)';

  const emblemSize = innerRadius * 0.28;

  const layout = useMemo(() => {
    const diameter = innerRadius * 2;
    const hasEmblem = Boolean(centerConfig.emblemIcon);
    const maxTextWidth = diameter * (hasEmblem ? 0.78 : 0.82);
    const hasPresentedBy = Boolean(brandName) && showBrandAttribution !== false;
    const footerReserve = hasPresentedBy ? innerRadius * 0.32 : 0;
    const maxBlockHeight = diameter * (hasLogos || hasEmblem ? 0.95 : 1.18) - footerReserve;
    const lines = buildLines(centerConfig, hubTextColor, mutedHubTextColor);

    let fitted = lines.map((line) => ({
      ...line,
      size: line.baseSize * innerRadius,
    }));

    for (let pass = 0; pass < 3; pass += 1) {
      const widths = fitted.map((line) =>
        measureText(line.text, `700 ${line.size}px "${line.font}", system-ui, sans-serif`)
      );
      const widest = Math.max(...widths, 1);
      const totalHeight =
        fitted.reduce((sum, line) => sum + line.size * 1.12, 0) +
        Math.max(0, fitted.length - 1) * innerRadius * 0.035;

      const widthScale = maxTextWidth / widest;
      const heightScale = maxBlockHeight / Math.max(totalHeight, 1);
      const scale = Math.min(1, widthScale, heightScale);

      if (scale >= 0.998) break;
      fitted = fitted.map((line) => ({ ...line, size: line.size * scale }));
    }

    const lineHeightFactor = 1.12;
    const gap = innerRadius * 0.035;
    const totalHeight =
      fitted.reduce((sum, line) => sum + line.size * lineHeightFactor, 0) +
      Math.max(0, fitted.length - 1) * gap;
    let offsetCursor = -totalHeight / 2 - (hasEmblem ? emblemSize * 0.35 : 0) + (hasPresentedBy ? footerReserve * 0.15 : 0);
    const positioned: Array<CenterLine & { size: number; y: number }> = [];
    for (const line of fitted) {
      const y = offsetCursor + (line.size * lineHeightFactor) / 2;
      offsetCursor += line.size * lineHeightFactor + gap;
      positioned.push({ ...line, y });
    }

    return { positioned, totalHeight };
  }, [centerConfig, innerRadius, hasLogos, hubTextColor, mutedHubTextColor, brandName, showBrandAttribution, emblemSize]);

  const logoSize = innerRadius * 0.32;
  const blockEdge = layout.totalHeight / 2;
  const logoY =
    logoPlacement === 'top'
      ? -Math.min(innerRadius - logoSize / 2 - 6, blockEdge + logoSize / 2 + 8)
      : Math.min(innerRadius - logoSize / 2 - 6, blockEdge + logoSize / 2 + 8);

  const emblemY = -innerRadius * 0.74;
  const presentedByY = innerRadius * 0.72;

  return (
    <g>
      <circle r={innerRadius} fill={centerColor} stroke="rgba(15,23,42,0.08)" strokeWidth={1} />

      <g color={hubTextColor}>
        <HubTicks radius={innerRadius} />
      </g>

      {centerConfig.emblemIcon ? (
        <g transform={`translate(0, ${emblemY})`}>
          <circle r={emblemSize * 0.48} fill="#ffffff" opacity={0.1} />
          <CenterEmblem name={centerConfig.emblemIcon} size={emblemSize * 0.58} color={hubTextColor} />
        </g>
      ) : null}

      {hasLogos && (
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

      {layout.positioned.map((line, index) => (
        <text
          key={`center-line-${index}`}
          y={line.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={line.color}
          style={{
            fontFamily: line.font,
            fontSize: line.size,
            fontWeight: line.weight,
            textTransform: 'uppercase',
            letterSpacing: line.letterSpacing ?? 'normal',
          }}
        >
          {line.text}
        </text>
      ))}

      {brandName && showBrandAttribution !== false ? (
        <g textAnchor="middle">
          <text
            y={presentedByY - 13}
            fill={mutedHubTextColor}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: Math.max(7, innerRadius * 0.065),
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            PRESENTED BY
          </text>
          <text
            y={presentedByY + 7}
            fill={hubTextColor}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: Math.max(11, innerRadius * 0.105),
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {brandName}
          </text>
        </g>
      ) : null}
    </g>
  );
}
