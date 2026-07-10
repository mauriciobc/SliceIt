import Papa from 'papaparse';
import { Slice } from '@/types/infographic';
import { nanoid } from './nanoid';

export function parseCsv(csvText: string): Slice[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  return result.data.map((row) => ({
    id: nanoid(),
    metric: row.metric?.trim() ?? '',
    label: row.label?.trim() ?? '',
    color: row.color?.trim() || undefined,
    icon: row.icon?.trim() || undefined,
  }));
}
