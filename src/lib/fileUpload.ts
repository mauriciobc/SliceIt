import { UploadedImage } from '@/types/infographic';
import { nanoid } from '@/lib/nanoid';

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

export type UploadRejectReason = 'type' | 'size';

export function validateImageFile(file: File): { ok: true } | { ok: false; reason: UploadRejectReason } {
  if (!['image/svg+xml', 'image/png'].includes(file.type)) {
    return { ok: false, reason: 'type' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: 'size' };
  }
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
