import { UploadedImage } from '@/types/infographic';
import { nanoid } from '@/lib/nanoid';

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
