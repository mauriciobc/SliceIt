import { describe, it, expect } from 'vitest';
import { fitText } from '@/lib/textFit';

describe('textFit', () => {
  it('fits short text without overflow', () => {
    const result = fitText('API', {
      maxWidth: 200,
      maxHeight: 100,
      fontFamily: 'Inter',
    });
    expect(result.overflow).toBe(false);
    expect(result.lines).toContain('API');
  });

  it('reports overflow for oversized text', () => {
    const result = fitText('A'.repeat(200), {
      maxWidth: 10,
      maxHeight: 10,
      fontFamily: 'Inter',
      minFontSize: 16,
      maxFontSize: 64,
    });
    expect(result.overflow).toBe(true);
  });

  it('wraps multi-word text into multiple lines', () => {
    const result = fitText('APPLICATION INSIGHTS REQUESTS', {
      maxWidth: 80,
      maxHeight: 200,
      fontFamily: 'Inter',
    });
    expect(result.lines.length).toBeGreaterThan(1);
  });
});
