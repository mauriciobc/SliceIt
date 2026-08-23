import { describe, it, expect } from 'vitest';
import {
  MAX_UPLOAD_BYTES,
  validateImageFile,
  validateImageFileContent,
  createUploadedImage,
} from '@/lib/fileUpload';

function fileOf(name: string, type: string, size: number, content = 'x'): File {
  const blob = new Blob([content.padEnd(size, 'x').slice(0, Math.max(size, content.length))]);
  return new File([blob], name, { type });
}

describe('validateImageFile', () => {
  it('accepts SVG and PNG uploads', () => {
    expect(validateImageFile(fileOf('a.svg', 'image/svg+xml', 100)).ok).toBe(true);
    expect(validateImageFile(fileOf('a.png', 'image/png', 100)).ok).toBe(true);
  });

  it('rejects unsupported types', () => {
    const r = validateImageFile(fileOf('a.txt', 'text/plain', 100));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('type');
  });

  it('rejects files over the size cap', () => {
    const r = validateImageFile(fileOf('big.png', 'image/png', MAX_UPLOAD_BYTES + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('size');
  });
});

describe('validateImageFileContent', () => {
  it('accepts benign SVGs and skips non-SVG files', async () => {
    const clean = new File(['<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>'], 'ok.svg', {
      type: 'image/svg+xml',
    });
    expect((await validateImageFileContent(clean)).ok).toBe(true);
    const png = new File(['png-bytes'], 'ok.png', { type: 'image/png' });
    expect((await validateImageFileContent(png)).ok).toBe(true);
  });

  it('rejects SVGs embedding a script element', async () => {
    const evil = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect/></svg>'],
      'evil.svg',
      { type: 'image/svg+xml' }
    );
    const r = await validateImageFileContent(evil);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('script');
  });
});

describe('createUploadedImage', () => {
  it('reads the file into a data URL', async () => {
    const f = new File(['hello'], 'x.svg', { type: 'image/svg+xml' });
    const image = await createUploadedImage(f);
    expect(image.dataUrl.startsWith('data:image/svg+xml;base64,')).toBe(true);
    expect(image.name).toBe('x.svg');
  });
});
