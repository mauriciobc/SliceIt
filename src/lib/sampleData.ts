import { ProjectState } from '@/types/infographic';
import { getLocale } from '@/i18n/runtime';
import type { Locale } from '@/i18n/translations';
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

// Default example for pt-BR: well-known numbers about Brazil so the starter
// infographic feels familiar to Brazilian users.
export const DEFAULT_SLICES_PT_BR = [
  { metric: '203 mi', label: 'POPULAÇÃO', color: '#009C3B', icon: 'Users' },
  { metric: '27', label: 'ESTADOS + DF', color: '#FFDF00', icon: 'Map' },
  { metric: '5', label: 'TÍTULOS DA COPA', color: '#002776', icon: 'Trophy' },
  { metric: '6 mi', label: 'TURISTAS NO CARNAVAL', color: '#F4C430', icon: 'Sparkles' },
  { metric: '60%', label: 'DA AMAZÔNIA NO BRASIL', color: '#28A745', icon: 'TreePine' },
  { metric: '43 mi', label: 'SACAS DE CAFÉ POR ANO', color: '#0059B3', icon: 'Leaf' },
  { metric: '12 mi', label: 'HABITANTES DE SÃO PAULO', color: '#00A3FF', icon: 'Building2' },
  { metric: '260 mi', label: 'FALANTES DO PORTUGUÊS', color: '#FF8500', icon: 'Globe' },
];

export function createDefaultProject(locale: Locale = getLocale()): ProjectState {
  const isPtBR = locale === 'pt-BR';
  const slices = (isPtBR ? DEFAULT_SLICES_PT_BR : DEFAULT_SLICES).map((slice) => ({
    ...slice,
    id: nanoid(),
  }));

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
      sourceNote: isPtBR ? 'Fonte: dados de exemplo do SliceIt' : 'Source: SliceIt sample data',
      brandName: 'SliceIt',
      showBrandAttribution: true,
    },
    sliceStyle: {
      fillMode: 'solid',
      gradientIntensity: 0.35,
    },
    palette: {
      mode: 'single',
      singleColor: isPtBR ? '#009C3B' : '#0066FF',
      gradientStart: isPtBR ? '#009C3B' : '#3CB371',
      gradientEnd: isPtBR ? '#FFDF00' : '#0077FF',
    },
    center: {
      title: isPtBR ? 'BRASIL' : 'EVERY',
      subtitle: isPtBR ? 'EM NÚMEROS' : 'MINUTE',
      footerCaption: isPtBR ? 'DADOS DE EXEMPLO' : 'OF THE DAY',
      titleFont: 'Oswald',
      subtitleFont: 'Oswald',
      captionFont: 'Inter',
      titleColor: '#f8fafc',
      subtitleColor: '#f8fafc',
      captionColor: '#cbd5e1',
      logos: [],
      logoPlacement: 'auto',
      emblemIcon: isPtBR ? 'Flag' : 'AlarmClock',
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
    slices,
    uploadedIcons: [],
    selectedSliceId: null,
  };
}