import { ProjectState } from '@/types/infographic';
import { nanoid } from './nanoid';

export const DEFAULT_SLICES = [
  { metric: '46M', label: 'API CALLS PROCESSED', color: '#4CC9F0', icon: 'Globe' },
  { metric: '12K', label: 'INCIDENTS RESOLVED', color: '#4895EF', icon: 'ShieldAlert' },
  { metric: '5.1M', label: 'REQUESTS HANDLED', color: '#4361EE', icon: 'Webhook' },
  { metric: '98.9%', label: 'UPTIME ACHIEVED', color: '#3F37C9', icon: 'Activity' },
  { metric: '2.4M', label: 'LOG EVENTS INGESTED', color: '#3A0CA3', icon: 'ScrollText' },
  { metric: '850K', label: 'USERS AUTHENTICATED', color: '#7209B7', icon: 'Fingerprint' },
  { metric: '14TB', label: 'DATA TRANSFERRED', color: '#F72585', icon: 'Database' },
  { metric: '320K', label: 'ALERTS TRIGGERED', color: '#FF006E', icon: 'Bell' },
];

export function createDefaultProject(): ProjectState {
  return {
    version: 1,
    canvas: {
      aspectRatio: '1:1',
      dimensions: { width: 1080, height: 1080 },
      backgroundColor: '#ffffff',
      segmentExtension: 1.48,
      textPadding: 0.4,
      innerRadiusRatio: 0.19,
      showDividers: true,
      dividerWidth: 4,
      sourceNote: 'Source: SliceIt sample data',
      brandName: 'SliceIt',
      showBrandAttribution: true,
    },
    sliceStyle: {
      fillMode: 'solid',
      gradientIntensity: 0.35,
    },
    palette: {
      mode: 'single',
      singleColor: '#0066FF',
      gradientStart: '#3CB371',
      gradientEnd: '#0077FF',
    },
    center: {
      title: 'EVERY',
      subtitle: 'MINUTE',
      footerCaption: 'OF THE DAY',
      titleFont: 'Oswald',
      subtitleFont: 'Oswald',
      captionFont: 'Inter',
      titleColor: '#f8fafc',
      subtitleColor: '#f8fafc',
      captionColor: '#cbd5e1',
      logos: [],
      logoPlacement: 'auto',
      emblemIcon: 'AlarmClock',
      deriveTextColors: true,
    },
    typography: {
      metricFont: 'Oswald',
      labelFont: 'Inter',
      metricColor: '#ffffff',
      labelColor: '#ffffff',
      showIcons: true,
      iconSize: 48,
      metricLabelGap: 0.35,
      iconVerticalPosition: 0.82,
      iconMargin: 8,
      iconPlacement: 'outer',
      rotateText: false,
      metricFontWeight: 700,
      textAlign: 'middle',
      autoTextContrast: true,
    },
    slices: DEFAULT_SLICES.map((slice) => ({ ...slice, id: nanoid() })),
    uploadedIcons: [],
    selectedSliceId: null,
  };
}
