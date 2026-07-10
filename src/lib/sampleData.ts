import { ProjectState } from '@/types/infographic';
import { nanoid } from './nanoid';

export const DEFAULT_SLICES = [
  { metric: '46M', label: 'API CALLS PROCESSED', color: '#4CC9F0' },
  { metric: '12K', label: 'INCIDENTS RESOLVED', color: '#4895EF' },
  { metric: '5.1M', label: 'REQUESTS HANDLED', color: '#4361EE' },
  { metric: '98.9%', label: 'UPTIME ACHIEVED', color: '#3F37C9' },
  { metric: '2.4M', label: 'LOG EVENTS INGESTED', color: '#3A0CA3' },
  { metric: '850K', label: 'USERS AUTHENTICATED', color: '#7209B7' },
  { metric: '14TB', label: 'DATA TRANSFERRED', color: '#F72585' },
  { metric: '320K', label: 'ALERTS TRIGGERED', color: '#FF006E' },
];

export function createDefaultProject(): ProjectState {
  return {
    version: 1,
    canvas: {
      aspectRatio: '1:1',
      dimensions: { width: 1080, height: 1080 },
      backgroundColor: '#ffffff',
      segmentExtension: 1.3,
      textPadding: 0.4,
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
      titleColor: '#111827',
      subtitleColor: '#111827',
      captionColor: '#6B7280',
      logos: [],
      logoPlacement: 'auto',
    },
    typography: {
      metricFont: 'Oswald',
      labelFont: 'Inter',
      metricColor: '#ffffff',
      labelColor: '#ffffff',
      showIcons: false,
      iconSize: 48,
      metricLabelGap: 0.35,
      iconVerticalPosition: 0.82,
      iconMargin: 8,
    },
    slices: DEFAULT_SLICES.map((slice) => ({ ...slice, id: nanoid() })),
    uploadedIcons: [],
    selectedSliceId: null,
  };
}
