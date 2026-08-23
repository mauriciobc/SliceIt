import { UploadedImage } from '@/types/infographic';
import { nanoid } from '@/lib/nanoid';

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

export type UploadRejectReason = 'type' | 'size' | 'script';

export function validateImageFile(file: File): { ok: true } | { ok: false; reason: UploadRejectReason } {
  if (!['image/svg+xml', 'image/png'].includes(file.type)) {
    return { ok: false, reason: 'type' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: 'size' };
  }
  return { ok: true };
}

/**
 * Defense-in-depth for SVG uploads: scripts never execute inside <img>/<image>
 * embedding, but the same file is often downloaded and opened directly, where
 * they would run. Reject any SVG payload that embeds a <script> element.
 */
export async function validateImageFileContent(
  file: File
): Promise<{ ok: true } | { ok: false; reason: 'script' }> {
  if (file.type !== 'image/svg+xml') return { ok: true };
  const text = await file.text();
  if (/<\s*script[\s>]/i.test(text)) return { ok: false, reason: 'script' };
  return { ok: true };
}

export async function createUploadedImage(file: File): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: nanoid(),
        name: file.name,
        dataUrl: reader.result as string,
        type: file.type as 'image/svg+xml' | 'image/png',
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}