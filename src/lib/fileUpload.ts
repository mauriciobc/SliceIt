import { UploadedImage } from '@/types/infographic';
import { nanoid } from './nanoid';

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function createUploadedImage(file: File): Promise<UploadedImage> {
  const dataUrl = await readFileAsDataURL(file);
  const type = file.type === 'image/svg+xml' ? 'image/svg+xml' : 'image/png';

  return {
    id: nanoid(),
    name: file.name,
    dataUrl,
    type,
  };
}
